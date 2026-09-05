import OrbitGame from '../../src/game/OrbitGame.jsx';

export const metadata = {
  title: "Liar’s Orbit — Play a Game",
  description: 'A little bluff. A little luck. A browser bluffing game for one player or a room of friends.',
  alternates: { canonical: '/play' },
};

export default function PlayPage() { return <OrbitGame />; }
