import axios from "axios";
import dayjs from "dayjs";

const state = {
    users: {},
    searchParams: {
        page: 1,
        perpage: 10,
        q: null,
        sortBy: ["created_at"],
        sortDesc: [true],
        filterBy: [],
        startDate: dayjs()
            .subtract(6, "days")
            .format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD") //needs to be ISO format: new Date().toISOString().substr(0, 10),
    },
    item: null
};

const getters = {};

const actions = {
    getItems({ commit }, p) {
        //reset current page if new search
        if (p) commit("setCurrentPage", 1);

        axios
            .get("/api/v1/users", { params: state.searchParams })
            .then(response => {
                commit("setUsers", response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },   
};

const mutations = {
    setUsers(state, data) {
        state.users = data;
    },
    setSearchParams(state, data) {
        state.searchParams = data;
    }, 
    setCurrentPage(state, data) {
        state.searchParams.page = data;
        state.users.current_page = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
