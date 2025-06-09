import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, User } from "lucide-react";

interface ProspectData {
  leadId: number;
  leadName: string;
  proposedRent: number;
  moveInDate: string;
  vacancyDate: string;
  totalRentalIncome: number;
  monthsOfRent: number;
}

interface RentalIncomeChartProps {
  propertyId: number;
  propertyName: string;
  currentRent: number;
  vacancyDate: string;
  prospects: ProspectData[];
}

export function RentalIncomeChart({ 
  propertyId, 
  propertyName, 
  currentRent, 
  vacancyDate, 
  prospects 
}: RentalIncomeChartProps) {
  
  const chartData = useMemo(() => {
    return prospects.map((prospect, index) => {
      const vacancyDateObj = new Date(vacancyDate);
      const moveInDateObj = new Date(prospect.moveInDate);
      const oneYearFromVacancy = new Date(vacancyDateObj);
      oneYearFromVacancy.setFullYear(oneYearFromVacancy.getFullYear() + 1);
      
      // Calculate vacancy period (lost rent)
      const vacancyDays = Math.max(0, (moveInDateObj.getTime() - vacancyDateObj.getTime()) / (1000 * 60 * 60 * 24));
      const vacancyMonths = vacancyDays / 30.44; // Average days per month
      
      // Calculate rental period
      const rentalDays = Math.max(0, (oneYearFromVacancy.getTime() - moveInDateObj.getTime()) / (1000 * 60 * 60 * 24));
      const rentalMonths = rentalDays / 30.44;
      
      // Calculate total income for this prospect
      const totalIncome = rentalMonths * prospect.proposedRent;
      const lostIncome = vacancyMonths * currentRent;
      const netIncome = totalIncome - lostIncome;
      
      return {
        name: prospect.leadName,
        proposedRent: prospect.proposedRent,
        moveInDate: prospect.moveInDate,
        totalIncome: Math.round(totalIncome),
        netIncome: Math.round(netIncome),
        vacancyMonths: Math.round(vacancyMonths * 10) / 10,
        rentalMonths: Math.round(rentalMonths * 10) / 10,
        lostIncome: Math.round(lostIncome),
        index
      };
    });
  }, [prospects, vacancyDate, currentRent]);

  const bestProspect = chartData.reduce((best, current) => 
    current.netIncome > best.netIncome ? current : best, chartData[0]
  );

  const getBarColor = (index: number) => {
    if (chartData[index] === bestProspect) return "#059669"; // Green for best
    if (chartData[index].netIncome < 0) return "#DC2626"; // Red for negative
    return "#2563EB"; // Blue for others
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Rental Income Analysis - {propertyName}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Projected 12-month income comparison based on vacancy date ({formatDate(vacancyDate)}) and prospect move-in dates
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {chartData.length > 0 ? (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelFormatter={(label) => `Prospect: ${label}`}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border rounded-lg shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <div className="space-y-1 text-sm">
                              <p>Proposed Rent: {formatCurrency(data.proposedRent)}/month</p>
                              <p>Move-in Date: {formatDate(data.moveInDate)}</p>
                              <p>Vacancy Period: {data.vacancyMonths} months</p>
                              <p>Rental Period: {data.rentalMonths} months</p>
                              <p>Lost Income: {formatCurrency(data.lostIncome)}</p>
                              <p className="font-semibold">Net Income: {formatCurrency(data.netIncome)}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="netIncome">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Best Prospect Highlight */}
            {bestProspect && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Recommended Prospect</h4>
                  <Badge className="bg-green-100 text-green-800">{bestProspect.name}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-green-600 font-medium">Net Income</p>
                    <p className="text-green-800 font-bold">{formatCurrency(bestProspect.netIncome)}</p>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium">Monthly Rent</p>
                    <p className="text-green-800">{formatCurrency(bestProspect.proposedRent)}</p>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium">Move-in Date</p>
                    <p className="text-green-800">{formatDate(bestProspect.moveInDate)}</p>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium">Vacancy Period</p>
                    <p className="text-green-800">{bestProspect.vacancyMonths} months</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Detailed Income Projection
              </h4>
              <div className="grid gap-3">
                {chartData.map((prospect, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      prospect === bestProspect 
                        ? 'bg-green-50 border-green-200' 
                        : prospect.netIncome < 0 
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{prospect.name}</h5>
                      <Badge variant={prospect === bestProspect ? "default" : "secondary"}>
                        {formatCurrency(prospect.netIncome)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs text-muted-foreground">
                      <div>
                        <p>Proposed Rent</p>
                        <p className="font-medium text-foreground">{formatCurrency(prospect.proposedRent)}</p>
                      </div>
                      <div>
                        <p>Move-in Date</p>
                        <p className="font-medium text-foreground">{formatDate(prospect.moveInDate)}</p>
                      </div>
                      <div>
                        <p>Vacancy Period</p>
                        <p className="font-medium text-foreground">{prospect.vacancyMonths}mo</p>
                      </div>
                      <div>
                        <p>Rental Period</p>
                        <p className="font-medium text-foreground">{prospect.rentalMonths}mo</p>
                      </div>
                      <div>
                        <p>Lost Income</p>
                        <p className="font-medium text-red-600">{formatCurrency(prospect.lostIncome)}</p>
                      </div>
                      <div>
                        <p>Total Income</p>
                        <p className="font-medium text-foreground">{formatCurrency(prospect.totalIncome)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No prospect data available for analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}