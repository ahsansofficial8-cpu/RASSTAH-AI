/**
 * ==============================================================================
 * RAASTAH (راستہ) — GROUP EXPEDITION WORKSPACE
 * Collaborative group trip planner with shared cost splitting,
 * destination polling, and WhatsApp group coordination.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, Plus, DollarSign, Vote, Share2, 
  CheckCircle2, Calendar, MapPin, Trash2, ArrowRight
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Badge } from '@/components/ui';

export default function GroupTrip() {
  const { id } = useParams();
  
  const [tripName, setTripName] = useState('Hunza & Passu Autumn Caravan');
  const [copied, setCopied] = useState(false);

  // Group members
  const [members, setMembers] = useState([
    { id: 1, name: 'Ahsan Warraich (Host)', phone: '+92 300 1234567', paid: 65000 },
    { id: 2, name: 'Bilal Ahmed', phone: '+92 321 8887766', paid: 25000 },
    { id: 3, name: 'Zainab Noor', phone: '+92 333 4445566', paid: 30000 },
    { id: 4, name: 'Hamza Tariq', phone: '+92 312 9991122', paid: 0 }
  ]);

  const [newMemberName, setNewMemberName] = useState('');

  // Expenses
  const [expenses, setExpenses] = useState([
    { id: 1, desc: 'Toyota Prado 4x4 Jeep Fuel & Tolls', amount: 48000, paidBy: 'Ahsan Warraich (Host)' },
    { id: 2, desc: 'Eagle Nest Duikar Hotel 2 Rooms', amount: 42000, paidBy: 'Ahsan Warraich (Host)' },
    { id: 3, desc: 'Attabad Lake Boat Cruise & Trout Lunch', amount: 18000, paidBy: 'Zainab Noor' },
    { id: 4, desc: 'Khunjerab National Park Permits', amount: 12000, paidBy: 'Bilal Ahmed' }
  ]);

  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const perPersonShare = Math.round(totalExpense / Math.max(1, members.length));

  // Polls
  const [pollVotes, setPollVotes] = useState({ option1: 3, option2: 1 });
  const [voted, setVoted] = useState(false);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setMembers([...members, { id: Date.now(), name: newMemberName.trim(), phone: '', paid: 0 }]);
    setNewMemberName('');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpenseDesc.trim() || !newExpenseAmount) return;
    setExpenses([
      ...expenses, 
      { 
        id: Date.now(), 
        desc: newExpenseDesc.trim(), 
        amount: Number(newExpenseAmount), 
        paidBy: members[0]?.name || 'Ahsan' 
      }
    ]);
    setNewExpenseDesc('');
    setNewExpenseAmount('');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageWrapper>
      <main className="min-h-screen bg-[var(--bg-page)] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Users size={14} />
                <span>EXPEDITION GROUP WORKSPACE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-slate-900">
                {tripName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Shared logistics, live cost splitting, and group voting across <strong>{members.length} expeditioners</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button 
                onClick={handleCopyLink}
                variant="outline" 
                className="text-xs font-bold flex items-center gap-2"
              >
                <Share2 size={14} />
                {copied ? 'Link Copied!' : 'Invite Group Members'}
              </Button>
              <Link 
                to="/planner"
                className="px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:bg-[var(--brand-primary-hover)] flex items-center gap-1.5 shadow-sm"
              >
                <span>Edit Itinerary Days</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Grid: Left Expenses, Right Members & Poll */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: Cost Splitting */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign size={20} className="text-emerald-600" />
                      Shared Expense Tracker
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Automated per-person equal settlement.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Expedition Pool</span>
                    <span className="text-xl font-bold font-mono text-slate-900">PKR {totalExpense.toLocaleString()}</span>
                  </div>
                </div>

                {/* Per person split banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-800 font-semibold block">Each Member’s Fair Share</span>
                    <span className="text-slate-600">Calculated across {members.length} active travelers</span>
                  </div>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    PKR {perPersonShare.toLocaleString()}
                  </span>
                </div>

                {/* Expenses List */}
                <div className="space-y-2.5">
                  {expenses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.desc}</span>
                        <span className="text-[11px] text-slate-500">Paid by {item.paidBy}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        PKR {item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Expense Form */}
                <form onSubmit={handleAddExpense} className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Record New Shared Expense</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="Expense item (e.g. Bonfire Wood, Food, Tolls)"
                      value={newExpenseDesc}
                      onChange={(e) => setNewExpenseDesc(e.target.value)}
                      className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="Amount (PKR)"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="w-full sm:w-36 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                    <Button type="submit" className="text-xs font-bold shrink-0">
                      Add Bill
                    </Button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right 5 Cols: Members & Group Poll */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Group Members Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Users size={18} className="text-emerald-600" />
                    Expedition Members ({members.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{m.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Paid PKR {m.paid.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add member input */}
                <form onSubmit={handleAddMember} className="pt-2 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Friend's Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                  <Button type="submit" variant="outline" className="text-xs font-bold shrink-0">
                    Add
                  </Button>
                </form>
              </div>

              {/* Live Group Decision Poll */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <Vote size={18} />
                  <span>Group Decision Poll</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  Where should we stop for Night 3 sunset?
                </h4>

                <div className="space-y-2.5 pt-1">
                  <button 
                    type="button"
                    disabled={voted}
                    onClick={() => {
                      setPollVotes({ ...pollVotes, option1: pollVotes.option1 + 1 });
                      setVoted(true);
                    }}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50 text-xs transition-all flex items-center justify-between group"
                  >
                    <span className="font-semibold text-slate-800 group-hover:text-emerald-700">
                      Eagle’s Nest Duikar (360° Panorama)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                      {pollVotes.option1} Votes
                    </span>
                  </button>

                  <button 
                    type="button"
                    disabled={voted}
                    onClick={() => {
                      setPollVotes({ ...pollVotes, option2: pollVotes.option2 + 1 });
                      setVoted(true);
                    }}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50 text-xs transition-all flex items-center justify-between group"
                  >
                    <span className="font-semibold text-slate-800 group-hover:text-emerald-700">
                      Attabad Lake Glamping Cottages
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px]">
                      {pollVotes.option2} Votes
                    </span>
                  </button>
                </div>

                {voted && (
                  <p className="text-[11px] text-emerald-600 font-semibold text-center pt-1">
                    ✓ Your vote has been recorded in the group tally!
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>
    </PageWrapper>
  );
}
