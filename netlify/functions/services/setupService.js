import { JwtManager } from '../infrastructure/jwt_provider.js';
import { SupabaseRepository } from '../infrastructure/supabase_repository.js';

import { settings } from '../config/settings.js';

import { AuthService } from './authService.js';
import {ResourceService} from './resourceService.js'
import { PrivilegesService } from './privilegeService.js';
import { JournalService } from './journalService.js';

const supabaseRepo = new SupabaseRepository(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
);

function get_auth_service(){
    const jwtManager = new JwtManager(supabaseRepo);
    const auth_service = new AuthService(supabaseRepo, jwtManager);
    return auth_service;
}

function get_resource_service(){
    const resource_service = new ResourceService(supabaseRepo);
    return resource_service;
}

function get_privilege_service(){
    const privilege_service = new PrivilegesService(supabaseRepo);
    return privilege_service;
}

function get_journal_service(){
    const journal_service = new JournalService(supabaseRepo);
    return journal_service;
}

const auth_service = get_auth_service();
const resource_service = get_resource_service();
const privilege_service = get_privilege_service();
const journal_service = get_journal_service();

// Export the ready-to-use singleton instance
export { auth_service , resource_service, privilege_service, journal_service};
export default auth_service;