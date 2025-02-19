'use client';

import { useEffect, useState } from 'react';
import apiService from '@/components/apiService';
import toast from 'react-hot-toast';
import withAdminAuth from '@/hoc/withAdminAuth.js';
import LoadingPage from '@/components/LoadingPage';  // for custom loading page

const AdminPage = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [contests, setContests] = useState([]);
  
  const [newMatch, setNewMatch] = useState({
    home_team: '',
    away_team: '',
    match_date: '',
    status: 'Upcoming',
  });
  
  const [newTeam, setNewTeam] = useState({
    userId: '',
    matchId: '',
    selectedPlayers: [],  //  array to store multiple players
    substitutes: [],       // array to store multiple substitutes
  });
  
  const [newContest, setNewContest] = useState({
    name: '',
    entryFee: 0,
    maxPlayers: 0,
    prizePool: 0,
    matchId: '',
  });

  const [loading, setLoading] = useState(true);  // Manage loading state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const matchesData = await apiService.fetchData('/admin/matches'); // fetch from API
      const teamsData = await apiService.fetchData('/admin/teams'); // fetch from API
      const contestsData = await apiService.fetchData('/admin/contests'); // fetch from API

      setMatches(matchesData || []);
      setTeams(teamsData || []);
      setContests(contestsData || []);
      
      setLoading(false);  // Data fetched, hide loading page
    } catch (error) {
      toast.error('Error fetching data');
      console.error('API Call Failed:', error);
      setLoading(false);  // Hide loading page in case of an error
    }
  };

  const handleCreateMatch = async () => {
    try {
      const response = await apiService.postData('/admin/matches', newMatch); // API POST request
      setMatches([...matches, response.data]);
      toast.success('Match added successfully!');
      setNewMatch({ home_team: '', away_team: '', match_date: '', status: 'Upcoming' });
    } catch (error) {
      toast.error('Error adding match');
      console.error('Error:', error);
    }
  };

  const handleCreateTeam = async () => {
    try {
      const response = await apiService.postData('/admin/teams', newTeam); // API POST request
      setTeams([...teams, response.data]);
      toast.success('Team added successfully!');
      setNewTeam({ userId: '', matchId: '', selectedPlayers: [], substitutes: [] });
    } catch (error) {
      toast.error('Error adding team');
      console.error('Error:', error);
    }
  };

  const handleCreateContest = async () => {
    try {
      const response = await apiService.postData('/admin/contests', newContest); // API POST request
      setContests([...contests, response.data]);
      toast.success('Contest added successfully!');
      setNewContest({ name: '', entryFee: 0, maxPlayers: 0, prizePool: 0, matchId: '' });
    } catch (error) {
      toast.error('Error adding contest');
      console.error('Error:', error);
    }
  };

  // Function to handle adding new players to the selected players or substitutes array
  const handleAddPlayer = (playerType, value) => {
    const updatedPlayers = value.trim().split(',').map(player => player.trim()); // Split by comma and remove extra spaces
    setNewTeam(prevState => ({
      ...prevState,
      [playerType]: updatedPlayers,
    }));
  };

  // If data is still loading, show the custom loading page
  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Admin Dashboard</h1>
      
      {/* Match Section */}
      <Section 
        title="Matches"
        data={matches}
        renderForm={
          <div>
            <h3 className="text-xl font-semibold mb-2">Add New Match</h3>
            <input
              type="text"
              className="border p-2 mb-2 w-full"
              placeholder="Home Team"
              value={newMatch.home_team}
              onChange={(e) => setNewMatch({ ...newMatch, home_team: e.target.value })}
            />
            <input
              type="text"
              className="border p-2 mb-2 w-full"
              placeholder="Away Team"
              value={newMatch.away_team}
              onChange={(e) => setNewMatch({ ...newMatch, away_team: e.target.value })}
            />
            <input
              type="datetime-local"
              className="border p-2 mb-2 w-full"
              value={newMatch.match_date}
              onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
            />
            <select
              className="border p-2 mb-2 w-full"
              value={newMatch.status}
              onChange={(e) => setNewMatch({ ...newMatch, status: e.target.value })}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={handleCreateMatch}
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              Add Match
            </button>
          </div>
        }
      />
      
      {/* Team Section */}
      <Section
        title="Teams"
        data={teams}
        renderForm={
          <div>
            <h3 className="text-xl font-semibold mb-2">Add New Team</h3>
            <input
              type="text"
              className="border p-2 mb-2 w-full"
              placeholder="User ID"
              value={newTeam.userId}
              onChange={(e) => setNewTeam({ ...newTeam, userId: e.target.value })}
            />
            <input
              type="text"
              className="border p-2 mb-2 w-full"
              placeholder="Match ID"
              value={newTeam.matchId}
              onChange={(e) => setNewTeam({ ...newTeam, matchId: e.target.value })}
            />
            <textarea
              className="border p-2 mb-2 w-full"
              placeholder="Enter Selected Players (comma separated)"
              value={newTeam.selectedPlayers.join(', ')}  // Join players with commas for display
              onChange={(e) => handleAddPlayer('selectedPlayers', e.target.value)}  // Handle add players
            />
            <textarea
              className="border p-2 mb-2 w-full"
              placeholder="Enter Substitutes (comma separated)"
              value={newTeam.substitutes.join(', ')}  // Join substitutes with commas for display
              onChange={(e) => handleAddPlayer('substitutes', e.target.value)}  // Handle add substitutes
            />
            <button
              onClick={handleCreateTeam}
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              Add Team
            </button>
          </div>
        }
      />
      
      {/* Contest Section */}
      <Section
        title="Contests"
        data={contests}
        renderForm={
          <div>
            <h3 className="text-xl font-semibold mb-2">Add New Contest</h3>
            <input
              type="text"
              className="border p-2 mb-2 w-full"
              placeholder="Contest Name"
              value={newContest.name}
              onChange={(e) => setNewContest({ ...newContest, name: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 mb-2 w-full"
              placeholder="Entry Fee"
              value={newContest.entryFee}
              onChange={(e) => setNewContest({ ...newContest, entryFee: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 mb-2 w-full"
              placeholder="Max Players"
              value={newContest.maxPlayers}
              onChange={(e) => setNewContest({ ...newContest, maxPlayers: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 mb-2 w-full"
              placeholder="Prize Pool"
              value={newContest.prizePool}
              onChange={(e) => setNewContest({ ...newContest, prizePool: e.target.value })}
            />
            <input
              type="text"
              className="border p-2 mb-2 w-full"
              placeholder="Match ID"
              value={newContest.matchId}
              onChange={(e) => setNewContest({ ...newContest, matchId: e.target.value })}
            />
            <button
              onClick={handleCreateContest}
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              Add Contest
            </button>
          </div>
        }
      />
    </div>
  );
}

function Section({ title, data, renderForm }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </div>
        ))}
      </div>
      <div className="mt-4">{renderForm}</div>
    </div>
  );
}

export default withAdminAuth(AdminPage);
