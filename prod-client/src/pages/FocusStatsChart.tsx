import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, TrendingUp, RefreshCw, Plus, Trash2 } from 'lucide-react';

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

  // Initialize with sample data
  useEffect(() => {
    const sampleSessions: FocusSession[] = [
      { id: '1', date: '2025-08-25', focusTime: 4.5, tasksCompleted: 8, category: 'Development' },
      { id: '2', date: '2025-08-26', focusTime: 6.2, tasksCompleted: 12, category: 'Design' },
      { id: '3', date: '2025-08-27', focusTime: 3.8, tasksCompleted: 6, category: 'Meetings' },
      { id: '4', date: '2025-08-28', focusTime: 5.5, tasksCompleted: 10, category: 'Development' },
      { id: '5', date: '2025-08-29', focusTime: 7.1, tasksCompleted: 15, category: 'Planning' },
      { id: '6', date: '2025-08-24', focusTime: 2.3, tasksCompleted: 4, category: 'Design' },
      { id: '7', date: '2025-08-23', focusTime: 1.8, tasksCompleted: 3, category: 'Meetings' },
      // Previous weeks data for monthly view
      { id: '8', date: '2025-08-18', focusTime: 5.2, tasksCompleted: 9, category: 'Development' },
      { id: '9', date: '2025-08-17', focusTime: 4.8, tasksCompleted: 11, category: 'Design' },
      { id: '10', date: '2025-08-16', focusTime: 3.5, tasksCompleted: 7, category: 'Planning' },
    ];
    setSessions(sampleSessions);
  }, []);

  const addRandomSession = () => {
    const categories = ['Development', 'Design', 'Meetings', 'Planning'];
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 7);
    const sessionDate = new Date(today.getTime() - randomDays * 24 * 60 * 60 * 1000);
    
    const newSession: FocusSession = {
      id: Date.now().toString(),
      date: sessionDate.toISOString().split('T')[0],
      focusTime: Math.round((Math.random() * 6 + 1) * 10) / 10,
      tasksCompleted: Math.floor(Math.random() * 15 + 1),
      category: categories[Math.floor(Math.random() * categories.length)]
    };

    setSessions(prev => [...prev, newSession]);
  };

  const clearAllData = () => {
    setSessions([]);
  };

  const generateWeeklyData = (): DayData[] => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today.getTime() - (today.getDay() - 1) * 24 * 60 * 60 * 1000);
    
    return dayNames.map((day, index) => {
      const currentDate = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(session => session.date === dateStr);
      const focusTime = daySessions.reduce((sum, session) => sum + session.focusTime, 0);
      const tasksCompleted = daySessions.reduce((sum, session) => sum + session.tasksCompleted, 0);
      
      return {
        day,
        focusTime: Math.round(focusTime * 10) / 10,
        tasksCompleted
      };
    });
  };

  const generateMonthlyData = (): WeekData[] => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const today = new Date();
    
    return weeks.map((week, weekIndex) => {
      const weekStart = new Date(today.getTime() - (4 - weekIndex) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });
      
      const focusTime = weekSessions.reduce((sum, session) => sum + session.focusTime, 0);
      const tasksCompleted = weekSessions.reduce((sum, session) => sum + session.tasksCompleted, 0);
      
      return {
        week,
        focusTime: Math.round(focusTime * 10) / 10,
        tasksCompleted
      };
    });
  };

  const generateCategoryData = (): CategoryData[] => {
    const categoryColors = {
      'Development': '#8884d8',
      'Design': '#82ca9d',
      'Meetings': '#ffc658',
      'Planning': '#ff7c7c'
    };

    const categoryTotals = sessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + session.focusTime;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, time) => sum + time, 0);
    
    return Object.entries(categoryTotals).map(([name, time]) => ({
      name,
      value: total > 0 ? Math.round((time / total) * 100) : 0,
      color: categoryColors[name as keyof typeof categoryColors] || '#888888'
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
      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={addRandomSession} variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Random Session
        </Button>
        <Button onClick={clearAllData} variant="outline" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Clear Data
        </Button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFocusTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'week' ? 'This week' : 'This month'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'week' ? 'This week' : 'This month'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Focus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageFocusTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Per {timeRange === 'week' ? 'day' : 'week'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Focus Time & Task Completion</CardTitle>
              <CardDescription>
                Track your productivity over time
              </CardDescription>
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
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="focusTime"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  name="Focus Time (h)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tasksCompleted"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                  name="Tasks Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Comparison</CardTitle>
            <CardDescription>Focus time vs tasks completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateWeeklyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="focusTime" fill="#8884d8" name="Focus Time (h)" />
                  <Bar dataKey="tasksCompleted" fill="#82ca9d" name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Time spent by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((category, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}: {category.value}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your focus sessions data</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sessions recorded yet.</p>
              <p className="text-sm">Add some sample data to see your stats!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.date}</span>
                      <Badge variant="secondary">{session.category}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {session.focusTime}h focus • {session.tasksCompleted} tasks
                    </div>
                  </div>
                  <Button
                    onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FocusStatsChart;