import { Contest } from "./contest";
import { Institution } from "./institution";
import { Person } from "./person";

export enum Prize {
    FIRST = "FIRST",
    SECOND = "SECOND",
    THIRD = "THIRD",
    MENTION = "MENTION"
}

export enum Medal {
    GOLD = "GOLD",
    SILVER = "SILVER",
    BRONZE = "BRONZE"
}

export interface Result {
    id: number,
    person: Person,
    institution: Institution | null,
    contest: Contest,
    year: number,
    score: number | null,
    place: number | null,
    prize: Prize | null,
    medal: Medal | null
    total: string | null;
}

export interface RankingResult extends RankingNumber {
    person: Person,
}

export interface RankingNumber {
    gold: number,
    silver: number,
    bronze: number,
    medals: number,
    participations: number
}

export const getMedalClass = (medal: Medal | null): string => {
    switch (medal) {
        case Medal.GOLD:
            return 'gold';
        case Medal.SILVER:
            return 'silver';
        case Medal.BRONZE:
            return 'bronze';
        default:
            return '';
    }
};