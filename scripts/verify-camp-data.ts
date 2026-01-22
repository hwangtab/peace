import { camps } from '../src/data/camps';
import { Participant } from '../src/types/camp';

const camp2025 = camps.find(c => c.id === 'camp-2025');

if (!camp2025) {
    console.error('Camp 2025 not found');
    process.exit(1);
}

const targetMusicianName = '블로꾸 자파리 & 뽈레뽈레';
const targetParticipant = camp2025.participants?.find(p => {
    if (typeof p === 'string') return p === targetMusicianName;
    return p.name === targetMusicianName;
});

console.log('--- Verification Result ---');
if (targetParticipant) {
    console.log('Found participant:', targetParticipant);

    if (typeof targetParticipant === 'object' && targetParticipant.musicianId === 13) {
        console.log('SUCCESS: Participant is an object with correct musicianId: 13');
    } else {
        console.log('FAILURE: Participant found but data is incorrect or string type.');
        console.log('Type:', typeof targetParticipant);
        if (typeof targetParticipant === 'object') {
            console.log('musicianId:', targetParticipant.musicianId);
        }
    }
} else {
    console.log('FAILURE: Participant not found in list.');
}
