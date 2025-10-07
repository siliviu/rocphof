export interface Contest {
    id: number,
    year: number,
    name: string,
    desc: string | null,
    country: string | null,
    city: string | null,
    participants: number | null
}