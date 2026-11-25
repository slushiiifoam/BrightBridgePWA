import { assistantTopics } from '../../../src/content/resourceCatalog.js'

const POPULATION = '(adolescen* OR youth OR teen* OR "young adult*")'
const MIN_YEAR = 2012
const PER_SOURCE = 6
const DEFAULT_TOPICS = ['dating', 'communication']

// Build literature queries from curated topic strings only; user text is never sent out.
export function buildLiteratureQuery(topics) {
  const chosen = (topics.length ? topics : DEFAULT_TOPICS).slice(0, 2)
  const clauses = chosen.map((topic) => `(${assistantTopics[topic].literature})`)
  return {
    key: chosen.slice().sort().join('+'),
    europePmc: `(${clauses.join(' OR ')}) AND ${POPULATION} AND SRC:MED AND PUB_YEAR:[${MIN_YEAR} TO 2100] AND NOT PUB_TYPE:"preprint"`,
    openAlex: `${chosen.map((topic) => assistantTopics[topic].literature.replace(/"/g, '').split(' OR ')[0]).join(' ')} adolescents`,
  }
}

function cleanDoi(doi) {
  return doi ? String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase() : ''
}

// Europe PMC's MEDLINE subset (SRC:MED) only indexes peer-reviewed journals.
async function searchEuropePmc(query, signal) {
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search')
  url.search = new URLSearchParams({ query, format: 'json', resultType: 'lite', pageSize: String(PER_SOURCE) })
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Europe PMC ${response.status}`)
  const payload = await response.json()
  return (payload.resultList?.result || []).map((item) => ({
    source: 'Europe PMC',
    title: item.title,
    venue: item.journalTitle || '',
    year: Number(item.pubYear) || null,
    authors: item.authorString || '',
    doi: cleanDoi(item.doi),
    url: item.doi ? `https://doi.org/${item.doi}` : `https://europepmc.org/article/${item.source}/${item.id}`,
    citedBy: item.citedByCount || 0,
  }))
}

// OpenAlex has no peer-review flag; journal articles that are not retracted are the closest filter.
async function searchOpenAlex(query, signal) {
  const url = new URL('https://api.openalex.org/works')
  url.search = new URLSearchParams({
    search: query,
    filter: `type:article,primary_location.source.type:journal,is_retracted:false,from_publication_date:${MIN_YEAR}-01-01`,
    'per-page': String(PER_SOURCE),
    select: 'id,doi,title,publication_year,primary_location,authorships,cited_by_count',
  })
  if (process.env.OPENALEX_MAILTO) url.searchParams.set('mailto', process.env.OPENALEX_MAILTO)
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`OpenAlex ${response.status}`)
  const payload = await response.json()
  return (payload.results || []).map((item) => ({
    source: 'OpenAlex',
    title: item.title,
    venue: item.primary_location?.source?.display_name || '',
    year: item.publication_year || null,
    authors: (item.authorships || []).slice(0, 3).map((a) => a.author?.display_name).filter(Boolean).join(', '),
    doi: cleanDoi(item.doi),
    url: item.doi || item.id,
    citedBy: item.cited_by_count || 0,
  }))
}

// Query both indexes in parallel under one deadline and keep whatever arrives.
export async function searchLiterature(query, timeoutMs) {
  const signal = AbortSignal.timeout(timeoutMs)
  const settled = await Promise.allSettled([
    searchEuropePmc(query.europePmc, signal),
    searchOpenAlex(query.openAlex, signal),
  ])

  const seen = new Set()
  const papers = []
  for (const result of settled) {
    if (result.status !== 'fulfilled') {
      console.warn('Literature search failed:', result.reason?.message)
      continue
    }
    for (const paper of result.value) {
      const key = paper.doi || paper.title?.toLowerCase()
      if (!paper.title || seen.has(key)) continue
      seen.add(key)
      papers.push(paper)
    }
  }

  return papers.slice(0, 10).map((paper, index) => ({ id: `p${index + 1}`, ...paper }))
}
