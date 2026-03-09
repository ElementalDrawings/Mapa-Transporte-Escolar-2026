// Native fetch in Node 24

async function checkDrift() {
    const url = 'http://localhost:3001/location/NB-2026';
    const res1 = await fetch(url).then(r => r.json());
    console.log('Update 1:', res1.lat, res1.lng, res1.timestamp);

    await new Promise(r => setTimeout(r, 3000));

    const res2 = await fetch(url).then(r => r.json());
    console.log('Update 2:', res2.lat, res2.lng, res2.timestamp);

    if (res1.id === res2.id) {
        console.log('NO CHANGE in ID - DB is not updating.');
    } else {
        console.log('ID CHANGED - DB is still receiving data.');
    }
}

checkDrift();
