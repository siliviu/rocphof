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
    institution: Institution,
    contest: Contest,
    year: number,
    score: number,
    place: number,
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