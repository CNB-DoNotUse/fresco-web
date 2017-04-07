import api from './api';

/**
 * Assignment model file
 */
const assignment = {

    /**
     * Finds assignments in a particular geospace
     * @param {String} viewMode The type of assignments you'd like to view e.g. `active`, `pending`, `expired`
     * @return {Array} Array of users who have reposted the gallery
     */
    list: (params = { sortBy: 'created_at', limit: 8, direction: 'desc' }, viewMode = null) => {

        if(viewMode === 'pending') {
            params.rating = 0;
        } else if(viewMode === 'active'){
            params.ends_after = Date.now();
            params.rating = 1;
        } else if(viewMode === 'expired') {
            params.rating = 1;
            params.ends_before = Date.now();
        }

        return api.get('assignment/list', params);
    },

    accepted: (assignmentId) => {
        return api.get(`assignment/${assignmentId}/accepted`);
    },

    get: (assignmentId) => {
        return api.get(`assignment/${assignmentId}`);  
    }
}

export const list = assignment.list;
export const accepted = assignment.accepted;
export const get = assignment.get;

export default assignment;