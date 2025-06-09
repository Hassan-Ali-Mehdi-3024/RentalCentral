import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, Eye } from "lucide-react";

interface InquiryData {
  date: string;
  inquiries: number;
  tours: number;
  dayName: string;
}

interface InquiryTrackingProps {
  propertyId: number;
  propertyName: string;
  dailyData: InquiryData[];
  totalInquiries: number;
  totalTours: number;
  conversionRate: number;
}

export function InquiryTracking({ 
  propertyId, 
  propertyName, 
  dailyData, 
  totalInquiries, 
  totalTours, 
  conversionRate 
}: InquiryTrackingProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate weekly totals
  const weeklyData = dailyData.reduce((weeks: any[], day, index) => {
    const weekIndex = Math.floor(index / 7);
    if (!weeks[weekIndex]) {
      weeks[weekIndex] = {
        week: `Week ${weekIndex + 1}`,
        inquiries: 0,
        tours: 0,
        startDate: day.date
      };
    }
    weeks[weekIndex].inquiries += day.inquiries;
    weeks[weekIndex].tours += day.tours;
    return weeks;
  }, []);

  const averageDailyInquiries = dailyData.length > 0 
    ? Math.round((totalInquiries / dailyData.length) * 10) / 10 
    : 0;

  const bestDay = dailyData.reduce((best, current) => 
    current.inquiries > best.inquiries ? current : best, 
    dailyData[0] || { inquiries: 0, date: '', dayName: '', tours: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Inquiries</p>
                <p className="text-2xl font-bold text-foreground">{totalInquiries}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Tours</p>
                <p className="text-2xl font-bold text-foreground">{totalTours}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Daily Average</p>
                <p className="text-2xl font-bold text-foreground">{averageDailyInquiries}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Inquiries Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Daily Inquiry Trend
          </CardTitle>
          {bestDay.inquiries > 0 && (
            <p className="text-muted-foreground text-sm">
              Best day: {bestDay.dayName} ({formatDate(bestDay.date)}) with {bestDay.inquiries} inquiries
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          {dailyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value, name) => [value, name === 'inquiries' ? 'Inquiries' : 'Tours']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inquiries" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tours" 
                    stroke="#059669" 
                    strokeWidth={2}
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No inquiry data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {weeklyData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="#2563EB" name="Inquiries" />
                  <Bar dataKey="tours" fill="#059669" name="Tours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No weekly data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day-by-Day Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {dailyData.length > 0 ? (
              dailyData.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{day.dayName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(day.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Inquiries</p>
                      <Badge variant="outline">{day.inquiries}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Tours</p>
                      <Badge variant="secondary">{day.tours}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <Badge variant={day.inquiries > 0 ? "default" : "outline"}>
                        {day.inquiries > 0 ? Math.round((day.tours / day.inquiries) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No daily data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}