import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export const RegionPages = () => {
    const [regions, setRegions] = useState<any>();
    const data = [
        "Alba",
        "Arad",
        "Arges",
        "Bacau",
        "Bihor",
        "Bistrita-Nasaud",
        "Botosani",
        "Braila",
        "Brasov",
        "Bucuresti",
        "Buzau",
        "Calarasi",
        "Caras-Severin",
        "Cluj",
        "Constanta",
        "Covasna",
        "Dambovita",
        "Dolj",
        "Galati",
        "Giurgiu",
        "Gorj",
        "Harghita",
        "Hunedoara",
        "Ialomita",
        "Iasi",
        "Ilfov",
        "Maramures",
        "Mehedinti",
        "Mures",
        "Neamt",
        "Olt",
        "Prahova",
        "Salaj",
        "Satu Mare",
        "Sibiu",
        "Suceava",
        "Teleorman",
        "Timis",
        "Tulcea",
        "Valcea",
        "Vaslui",
        "Vrancea",
    ];
    useEffect(() => {
        setRegions(data.map((region: string) => <li><Link to={`/region/${region}`}>{region}</Link></li>))
    }, []);
    document.title = "ROCPHOF";
    return <>
        <div className='panel'>
            <div className='contest-list'>
                <ul>
                    {regions}
                </ul>
            </div>
        </div>
    </>
}