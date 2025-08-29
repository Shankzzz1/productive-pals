import  { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock, CheckCircle, TrendingUp, Trash2 } from 'lucide-react';
import axios from 'axios';

interface FocusSession {
  id: string;
  date: string;
  focusTime: number;
  tasksCompleted: number;
  category: string;
}

interface DayData {
  day: string;
  focusTime: number;
  tasksCompleted: number;
}

interface WeekData {
  week: string;
  focusTime: number;
  tasksCompleted: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const FocusStatsChart = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // Fetch sessions from backend
  useEffect(() => {
  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/focus', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure res.data is an array
      const data = Array.isArray(res.data) ? res.data : [];
      setSessions(data);
    } catch (err) {
      console.error('Error fetching focus sessions:', err);
      setSessions([]); // fallback
    }
  };
  fetchSessions();
}, []);


  const clearAllData = async () => {
    try {
      await axios.delete('http://localhost:5000/api/focus', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSessions([]);
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  };

  const generateWeeklyData = (): DayData[] => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    return dayNames.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + index);
      const dateStr = currentDate.toISOString().split('T')[0];

      const daySessions = sessions.filter(session => session.date === dateStr);
      const focusTime = daySessions.reduce((sum, session) => sum + session.focusTime, 0);
      const tasksCompleted = daySessions.reduce((sum, session) => sum + session.tasksCompleted, 0);

      return { day, focusTime: Math.round(focusTime * 10) / 10, tasksCompleted };
    });
  };

  const generateMonthlyData = (): WeekData[] => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return weeks.map((week, weekIndex) => {
      const weekStart = new Date(firstDayOfMonth);
      weekStart.setDate(firstDayOfMonth.getDate() + (weekIndex * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const focusTime = weekSessions.reduce((sum, session) => sum + session.focusTime, 0);
      const tasksCompleted = weekSessions.reduce((sum, session) => sum + session.tasksCompleted, 0);

      return { week, focusTime: Math.round(focusTime * 10) / 10, tasksCompleted };
    });
  };

  const generateCategoryData = (): CategoryData[] => {
    const categoryColors: Record<string, string> = {
      'Development': '#8884d8',
      'Design': '#82ca9d',
      'Meetings': '#ffc658',
      'Planning': '#ff7c7c',
      'Other': '#888888'
    };

    const categoryTotals = sessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + session.focusTime;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, time) => sum + time, 0);

    return Object.entries(categoryTotals).map(([name, time]) => ({
      name,
      value: total > 0 ? Math.round((time / total) * 100) : 0,
      color: categoryColors[name] || categoryColors['Other']
    }));
  };

  const currentData = timeRange === 'week' ? generateWeeklyData() : generateMonthlyData();
  const categoryData = generateCategoryData();
  const totalFocusTime = currentData.reduce((sum, item) => sum + item.focusTime, 0);
  const totalTasks = currentData.reduce((sum, item) => sum + item.tasksCompleted, 0);
  const averageFocusTime = currentData.length > 0 ? totalFocusTime / currentData.length : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">Focus Time: {payload[0]?.value}h</p>
          <p className="text-green-600">Tasks: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFocusTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">{timeRange === 'week' ? 'This week' : 'This month'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{timeRange === 'week' ? 'This week' : 'This month'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Focus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageFocusTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Per {timeRange === 'week' ? 'day' : 'week'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Focus Time & Task Completion</CardTitle>
              <CardDescription>Track your productivity over time</CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={timeRange === 'week' ? 'day' : 'week'} 
                  fontSize={12} 
                />
                <YAxis 
                  yAxisId="left" 
                  fontSize={12}
                  label={{ value: 'Focus Time (h)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  fontSize={12}
                  label={{ value: 'Tasks Completed', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="focusTime" 
                  name="Focus Time (h)"
                  stroke="#8884d8" 
                  strokeWidth={3} 
                  dot={{ fill: '#8884d8', r: 4 }} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="tasksCompleted" 
                  name="Tasks Completed"
                  stroke="#82ca9d" 
                  strokeWidth={3} 
                  dot={{ fill: '#82ca9d', r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Time by Category</CardTitle>
          <CardDescription>How you spend your focus time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data Button */}
      <div className="flex justify-end">
        <Button variant="destructive" onClick={clearAllData} className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Clear All Data
        </Button>
      </div>
    </div>
  );
};

export default FocusStatsChart;