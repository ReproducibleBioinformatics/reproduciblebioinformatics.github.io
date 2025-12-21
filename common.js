// Common functions used across pages

// Team loading function
const teamFiles = [
    'Raffaele_Calogero.json',
    'Luca_Alessandri.json',
    'Andrea_loiacono.json',
    'Agata_Donofrio.json',
    'Beatrice_Nuvolari.json',
    'Eliseo_Martelli.json',
    'Maddalena_Arigoni.json',
    'Maria_luisa_ratto.json',
    'isabella_Castellano.json',
    'Sebastian_Bucatariu.json',
    'Neha-Kulkarni.json',
    'riccardoPanero.json',
    'Sofia.json'
];

async function loadTeam() {
    const currentMembers = document.getElementById('current-members');
    const formerMembers = document.getElementById('former-members');

    for (const file of teamFiles) {
        try {
            const response = await fetch(`Team/Descriptions/${file}`);
            if (!response.ok) continue;

            const member = await response.json();
            const card = createTeamCard(member);

            if (member.endDate === 'current') {
                currentMembers.appendChild(card);
            } else {
                formerMembers.appendChild(card);
            }
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }
}

function createTeamCard(member) {
    const card = document.createElement('div');
    card.className = 'team-card';

    // Determine photo path based on whether member is current or former
    let photoPath;
    if (member.endDate !== 'current') {
        // Former member - check if photo is in former_member subdirectory
        photoPath = member.photo.includes('/') ? member.photo : `Team/former_member/${member.photo}`;
    } else {
        // Current member
        photoPath = member.photo.includes('/') ? member.photo : `Team/${member.photo}`;
    }

    card.innerHTML = `
        <img src="${photoPath}" alt="${member.firstName} ${member.lastName}">
        <h4>${member.firstName} ${member.lastName}</h4>
        <div class="position">${member.position}</div>
        ${member.email ? `<div class="email"><a href="mailto:${member.email}">${member.email}</a></div>` : ''}
    `;

    return card;
}
