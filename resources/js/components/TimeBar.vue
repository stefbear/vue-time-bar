<template>
    <div class="time-bar-container pa-2">
        <div v-if="!hideSearch" class="search-input-container">
            <v-btn
                icon
                @click.stop="searchStore()"
                class="mr-2"
                aria-label="refresh"
            >
                <v-icon>
                    mdi-refresh
                </v-icon>
            </v-btn>

            <v-text-field
                v-model="searchParams.q"
                :label="searchLabel"
                single-line
                hide-details
                clearable
                @keyup="searchStore()"
                @click:clear="searchStore()"
            ></v-text-field>
        </div>

        <div v-if="!hideFilter" class="filter-input-container">
            <v-select
                label="Search Filters"
                hide-details
                v-model="searchParams.filterBy"
                :items="filters"
                item-text="text"
                item-value="value"
                multiple
                @change="searchStore()"
            >
                <template v-slot:prepend-item>
                    <v-list-item @click="filterByAllToggle">
                        <v-list-item-action>
                            <v-icon>
                                {{ filterByAllIcon }}
                            </v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>
                                Select All
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="mt-2"></v-divider>
                </template>

                <template v-slot:selection="{ item, index }">
                    <v-chip small v-if="index === 0">
                        <span>{{ item.text }}</span>
                    </v-chip>
                    <span v-if="index === 1" class="grey--text caption">
                        (+{{ searchParams.filterBy.length - 1 }})
                    </span>
                </template>
            </v-select>
        </div>

        <div class="break d-lg-none"></div>

        <div
            v-if="!hideDateRange"
            class="time-input-container justify-sm-start justify-md-center"
        >
            <v-btn
                icon
                @click.stop="dateSkipBackward()"
                aria-label="Move backward one week"
            >
                <v-icon> mdi-skip-backward </v-icon>
            </v-btn>
            <v-btn
                icon
                @click.stop="dateStepBackward()"
                aria-label="Move backward one week"
            >
                <v-icon> mdi-step-backward </v-icon>
            </v-btn>

            <v-menu
                v-model="fromDateMenu"
                :value="searchParams.startDate"
                :close-on-content-click="false"
                transition="slide-y-transition"
                offset-y
            >
                <template v-slot:activator="{ on, attrs }">
                    <div class="date-input-container">
                        <v-text-field
                            dense
                            filled
                            readonly
                            single-line
                            hide-details
                            label="From"
                            :value="fromDateValComputed"
                            v-bind="attrs"
                            v-on="on"
                            aria-label="start date"
                        ></v-text-field>
                    </div>
                </template>
                <v-date-picker
                    landscape
                    scrollable
                    show-current
                    show-adjacent-months
                    locale="en-us"
                    color="secondary"
                    v-model="searchParams.startDate"
                    @input="fromDateMenu = false"
                    @change="searchStore()"
                    :allowed-dates="allowedDatesStart"
                ></v-date-picker>
            </v-menu>

            <v-menu
                v-model="toDateMenu"
                :value="searchParams.endDate"
                :close-on-content-click="false"
                transition="slide-y-transition"
                offset-y
            >
                <template v-slot:activator="{ on, attrs }">
                    <div class="date-input-container">
                        <v-text-field
                            dense
                            filled
                            readonly
                            single-line
                            hide-details
                            label="To"
                            :value="toDateValComputed"
                            v-bind="attrs"
                            v-on="on"
                            aria-label="end date"
                        ></v-text-field>
                    </div>
                </template>
                <v-date-picker
                    landscape
                    scrollable
                    show-current
                    show-adjacent-months
                    locale="en-us"
                    color="secondary"
                    v-model="searchParams.endDate"
                    @input="toDateMenu = false"
                    @change="searchStore()"
                    :allowed-dates="allowedDatesEnd"
                ></v-date-picker>
            </v-menu>

            <v-btn
                icon
                @click.stop="dateStepForward()"
                aria-label="Move forward one week"
            >
                <v-icon> mdi-step-forward </v-icon>
            </v-btn>
            <v-btn
                icon
                @click.stop="dateSkipForward()"
                aria-label="Move forward one year"
            >
                <v-icon> mdi-skip-forward </v-icon>
            </v-btn>
        </div>

        <div class="break d-md-none"></div>

        <div v-if="!hideActions" class="action-input-container justify-sm-end">
            <slot></slot>
        </div>
    </div>
</template>
<script>
import dayjs from "dayjs";
import settings from "../settings";

var searchtimer;

export default {
    props: {
        store: {
            type: String,
            default: null
        },
        searchLabel: {
            type: String,
            default: "Search"
        },
        filters: {
            type: Array,
            default() {
                return [];
            }
        },
        hideSearch: {
            type: Boolean,
            default: false
        },
        hideFilter: {
            type: Boolean,
            default: false
        },
        hideDateRange: {
            type: Boolean,
            default: false
        },
        hideActions: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            fromDateMenu: false,
            toDateMenu: false
        };
    },
    computed: {
        fromDateValComputed() {
            return this.searchParams.startDate
                ? dayjs(this.searchParams.startDate).format("MMM D, YYYY")
                : "";
        },
        toDateValComputed() {
            return this.searchParams.endDate
                ? dayjs(this.searchParams.endDate).format("MMM D, YYYY")
                : "";
        },
        searchParams: {
            get() {
                if (!this.store) {
                    console.log("No store specified. Operation aborted.");
                    return;
                }

                return this.$store.state[this.store].searchParams;
            },
            set(value) {
                if (!this.store) {
                    console.log("No store specified. Operation aborted.");
                    return;
                }

                this.$store.commit(this.store + "/setSearchParams", value);
            }
        },
        filterByAllSelectedAll() {
            return this.searchParams.filterBy.length === this.filters.length;
        },
        filterByAllSelectedSome() {
            return (
                this.searchParams.filterBy.length > 0 &&
                !this.filterByAllSelectedAll
            );
        },
        filterByAllIcon() {
            if (this.filterByAllSelectedAll) return "mdi-close-box";
            if (this.filterByAllSelectedSome) return "mdi-minus-box";
            return "mdi-checkbox-blank-outline";
        }
    },
    methods: {
        searchStore(newSearchQuery = true) {
            if (!this.store) {
                console.log("No store specified. Operation aborted.");
                return;
            }

            searchtimer && clearTimeout(searchtimer);
            searchtimer = setTimeout(() => {
                this.$store.dispatch(this.store + "/getItems", newSearchQuery);
            }, 250);
        },
        dateStepForward() {
            this.searchParams.endDate = dayjs(this.searchParams.endDate)
                .add(settings.DATE_STEP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchParams.startDate = dayjs(this.searchParams.startDate)
                .add(settings.DATE_STEP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchStore();
        },
        dateSkipForward() {
            this.searchParams.endDate = dayjs(this.searchParams.endDate)
                .add(settings.DATE_SKIP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchParams.startDate = dayjs(this.searchParams.startDate)
                .add(settings.DATE_SKIP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchStore();
        },
        dateStepBackward() {
            this.searchParams.endDate = dayjs(this.searchParams.endDate)
                .subtract(settings.DATE_STEP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchParams.startDate = dayjs(this.searchParams.startDate)
                .subtract(settings.DATE_STEP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchStore();
        },
        dateSkipBackward() {
            this.searchParams.endDate = dayjs(this.searchParams.endDate)
                .subtract(settings.DATE_SKIP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchParams.startDate = dayjs(this.searchParams.startDate)
                .subtract(settings.DATE_SKIP_INCREMENT_DAYS, "days")
                .format("YYYY-MM-DD");
            this.searchStore();
        },
        allowedDatesStart(val) {
            return val <= this.searchParams.endDate;
        },
        allowedDatesEnd(val) {
            return val >= this.searchParams.startDate;
        },
        filterByAllToggle() {
            this.$nextTick(() => {
                if (this.filterByAllSelectedAll) {
                    this.searchParams.filterBy = [];
                } else {
                    let all = this.filters.slice(0, this.filters.length);
                    this.searchParams.filterBy = all.map(x => x["value"]);
                }
                this.searchStore();
            });
        }
    }
};
</script>
<style>
.theme--light .time-bar-container {
    background-color: #f5f5f5;
}
.time-bar-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}
.time-bar-container .break {
    flex-basis: 100%;
    height: 0;
}
.time-bar-container .v-text-field {
    margin: 0;
    padding: 0;
}
.filter-input-container {
    min-width: 155px !important;
    max-width: 155px !important;
    margin: 0 0.375rem;
}
.date-input-container {
    min-width: 128px !important;
    max-width: 128px !important;
    margin: 0 0.375rem;
}
.search-input-container {
    align-items: center;
    justify-content: center;
    display: flex;
    margin: 4px;
    flex-grow: 6;
    margin: 0.5rem;
}
.filter-input-container,
.time-input-container,
.action-input-container {
    align-items: center;
    justify-content: center;
    display: flex;
    margin: 4px;
    flex-grow: 0;
    margin: 0.5rem;
}
.date-input-container input {
    text-align: center !important;
}
.date-input-container .v-input {
    font-size: inherit;
}
.date-input-container
    .v-text-field--filled.v-input--dense.v-text-field--single-line
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--filled.v-input--dense.v-text-field--outlined
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--filled.v-input--dense.v-text-field--outlined.v-text-field--filled
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--full-width.v-input--dense.v-text-field--single-line
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--full-width.v-input--dense.v-text-field--outlined
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--full-width.v-input--dense.v-text-field--outlined.v-text-field--filled
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--outlined.v-input--dense.v-text-field--single-line
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--outlined.v-input--dense.v-text-field--outlined
    > .v-input__control
    > .v-input__slot,
.date-input-container
    .v-text-field--outlined.v-input--dense.v-text-field--outlined.v-text-field--filled
    > .v-input__control
    > .v-input__slot {
    min-height: 32px;
}
</style>
