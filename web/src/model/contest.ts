import { CONTEST_ONI, CONTEST_LOT } from "../constants";

export interface Contest {
    id: number,
    year: number,
    name: string,
    subject: string | null,
    desc: string | null,
    country: string | null,
    city: string | null,
    participants: number | null,
    start: string | null,
    end: string | null,
    site: string | null
}

export const isInternational = (contest: Contest | null | undefined): boolean =>
    !!contest && contest.name !== CONTEST_ONI && contest.name !== CONTEST_LOT;
