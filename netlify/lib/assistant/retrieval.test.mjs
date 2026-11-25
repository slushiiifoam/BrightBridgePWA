// Run with: node --test netlify/lib/assistant/retrieval.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crisisResources, detectCrisis, normalizeQuestion } from './retrieval.mjs'

const CRISIS = [
  'I want to kill myself',
  "I don't want to live anymore",
  'I don’t want to be here anymore', // curly apostrophe, like a phone keyboard types
  'sometimes I think about suicide',
  'I have been cutting myself again',
  'I self-harm when things get bad',
  'I took too many pills, is that an overdose?',
  'I was raped at a party',
  'My ex sexually assaulted me',
  'He said he is going to hurt me',
  'I am in danger right now',
  'i just wanna die',
]

const EVERYDAY = [
  'I keep fighting with my mom about curfew',
  'My boyfriend checks my phone and gets jealous',
  'This homework is killing me',
  'How do I tell my friend she hurt my feelings?',
  'I feel left out of the group chat',
  'How do I set boundaries with my sister?',
  'My grades are in danger of dropping',
  'I am so stressed about finals',
  'We broke up and I miss him',
  'How do I say no when my friends pressure me?',
]

test('crisis sentences take the crisis path', () => {
  for (const sentence of CRISIS) {
    assert.equal(detectCrisis(normalizeQuestion(sentence)), true, sentence)
  }
})

test('everyday sentences do not', () => {
  for (const sentence of EVERYDAY) {
    assert.equal(detectCrisis(normalizeQuestion(sentence)), false, sentence)
  }
})

test('the crisis path returns all five hotlines, 988 first', () => {
  const ids = crisisResources().map((resource) => resource.id)
  assert.equal(ids.length, 5)
  assert.equal(ids[0], 'crisis-988')
})
