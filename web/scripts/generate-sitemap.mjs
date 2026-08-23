/*
 * Generates public/sitemap.xml from the live API.
 *
 * Person pages are not included: there is no endpoint that lists every person,
 * only /people?name=<search>. They stay reachable through the contest, region
 * and institution pages that are listed here.
 */
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SITE = process.env.SITE_URL ?? 'https://rocphof.kilonova.ro';
const API = process.env.API_URL ?? `${SITE}/results`;

const CONTEST_ONI = 'ONI';
const CONTEST_LOT = 'LOT';
const ONI_GRADES = [5, 6, 7, 8, 9, 10, 11, 12];
const LOT_LEVELS = [0, 1, 2];
const GRADE_INTERNATIONAL = 1;

const here = dirname(fileURLToPath(import.meta.url));

const fetchJson = async path => {
    const response = await fetch(`${API}${path}`);
    if (!response.ok) throw new Error(`${path} responded ${response.status}`);
    return response.json();
};

const main = async () => {
    const [contests, institutions, regionMapping] = await Promise.all([
        fetchJson('/contests'),
        fetchJson('/institutions'),
        readFile(resolve(here, '../src/assets/ro.json'), 'utf8').then(JSON.parse),
    ]);

    const paths = new Set([
        '/',
        '/contests',
        '/regions',
        '/rankings/people',
        '/rankings/institutions',
        '/rankings/regions',
        '/history',
    ]);

    const internationalNames = new Set();

    contests.forEach(contest => {
        paths.add(`/contest/${contest.id}`);
        if (contest.name === CONTEST_ONI) {
            ONI_GRADES.forEach(grade => paths.add(`/contest/${contest.id}/${grade}`));
        } else if (contest.name === CONTEST_LOT) {
            LOT_LEVELS.forEach(level => paths.add(`/contest/${contest.id}/${level}`));
        } else {
            paths.add(`/contest/${contest.id}/${GRADE_INTERNATIONAL}`);
            internationalNames.add(contest.name);
        }
    });

    internationalNames.forEach(name => paths.add(`/history/${encodeURIComponent(name)}`));

    institutions.forEach(institution => paths.add(`/institution/${institution.id}`));

    new Set(regionMapping.features.map(feature => feature.properties.name))
        .forEach(region => paths.add(`/region/${encodeURIComponent(region)}`));

    const urls = [...paths]
        .sort()
        .map(path => `  <url><loc>${SITE}${path}</loc></url>`)
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

    const target = resolve(here, '../public/sitemap.xml');
    await writeFile(target, xml, 'utf8');
    console.log(`Wrote ${paths.size} urls to ${target}`);
};

main().catch(error => {
    console.error(`Failed to generate sitemap: ${error.message}`);
    process.exit(1);
});
