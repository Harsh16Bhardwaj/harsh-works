import OrbitGame from '../../src/game/OrbitGame.jsx';

export const metadata = {
  title: "Last Bluff — Play a Game",
  description: 'Bluff the table, call the lie, and survive the hammer in a quick browser game for one player or friends.',
  alternates: { canonical: '/play' },
};

export default function PlayPage() { return <OrbitGame />; }
