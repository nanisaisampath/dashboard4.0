import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/context/DashboardContext';
import { prepareTimeSeriesData, prepareCategoryData } from '@/utils/dataProcessor';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';


// Chart colors
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
  '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'
];

const Charts = () => {
  // Now include selectTicketsByCategory from context
  const { filteredData, isLoading, selectTicketsByCategory } = useDashboard();

  // Prepare chart data
  const timeSeriesData = React.useMemo(() => {
    if (!filteredData) return [];
    return prepareTimeSeriesData(filteredData);
  }, [filteredData]);

  const technologyData = React.useMemo(() => {
    if (!filteredData) return [];
    return prepareCategoryData(filteredData, 'Technology');
  }, [filteredData]);

  const clientData = React.useMemo(() => {
    if (!filteredData) return [];
    return prepareCategoryData(filteredData, 'Client');
  }, [filteredData]);

  const ticketTypeData = React.useMemo(() => {
    if (!filteredData) return [];
    return prepareCategoryData(filteredData, 'TicketType');
  }, [filteredData]);

  const statusData = React.useMemo(() => {
    if (!filteredData) return [];
    return prepareCategoryData(filteredData, 'Status');
  }, [filteredData]);

  const assignedToData = React.useMemo(() => {
    if (!filteredData) return [];
    return prepareCategoryData(filteredData, 'Assigned to');
  }, [filteredData]);
  
  // 3D effect style for charts
  const chartStyle = {
    filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
  };

  // Handle bar click for drill-down
  const handleBarClick = (data: any, categoryName: string) => {
    if (data && data.activeLabel) {
      selectTicketsByCategory(categoryName, data.activeLabel);
    }
  };

  // Handle pie click for drill-down
  const handlePieClick = (data: any, index: number, categoryName: string) => {
    if (data && data.name) {
      console.log(`Clicked on ${categoryName} with value ${data.name}`);
      selectTicketsByCategory(categoryName, data.name);
    }
  };

  // Handle line chart click for drill-down
  const handleLineClick = (data: any) => {
    if (data && data.activeLabel) {
      selectTicketsByCategory('date', data.activeLabel);
    }
  };
  //custome lagend for the pie chart
  const renderCustomLegend = (props: any) => {
  const { payload } = props; // payload contains the legend items


  return (
    <ul className="custom-legend-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div 
            style={{ 
              width: 14, 
              height: 14, 
              backgroundColor: entry.color, 
              marginRight: 8,
              borderRadius: '50%',
            }} 
          />
          <span>{entry.value} - {ticketTypeData[index]?.value} tickets</span>
        </li>
      ))}
    </ul>
  );
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      {/* Line Chart: Tickets over time */}
      <Card className="chart-container col-span-1 md:col-span-2">
  <CardHeader>
    <CardTitle>
      Ticket Trend{" "}
      {timeSeriesData?.length > 0 && (
        <span className="text-lg text-white ml-2">
          ({new Date(timeSeriesData[0].date).toLocaleDateString()} - {new Date(timeSeriesData[timeSeriesData.length - 1].date).toLocaleDateString()})
        </span>
      )}
    </CardTitle>
  </CardHeader>
  <CardContent className="h-[300px]">
    {isLoading ? (
      <div className="flex items-center justify-center h-full">
        <p>Loading chart data...</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={timeSeriesData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          style={chartStyle}
          onClick={handleLineClick}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12  , fill: '#ffffff'}}
            tickFormatter={(val) => {
              const date = new Date(val);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            tick={{ fontSize: 12  , fill: '#ffffff'}}
            label={{ value: 'Ticket Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} tickets`, 'Count']}
            labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="tickets"
            name="Tickets"
            stroke="#0088FE"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</Card>


      {/* Bar Chart: Tickets by Technology/Platform */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>List by Technology</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={technologyData}
                margin={{ top: 15, right: 30, left: 20, bottom: 50 }}
                style={chartStyle}
                onClick={(data) => handleBarClick(data, 'technology')}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 15  , fill: '#ffffff'  }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 , fill: '#ffffff'}} />
                        <Bar
          dataKey="value"
          fill="url(#barColor)"
          radius={[6, 6, 0, 0]}
          animationDuration={800}
        >
          <LabelList 
            dataKey="value" 
            position="top" 
            fill="#ffffff"
            fontSize={14}
            fontWeight="bold"
          />
        </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart: Tickets by Client */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Tickets by Client</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-auto">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientData}
                margin={{ top: 15, right: 30, left: 20, bottom: 50 }}
                style={chartStyle}
                onClick={(data) => handleBarClick(data, 'client')}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 15 , fill: '#ffffff'}}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 , fill: '#ffffff' }} />
                
                
                        <Bar
          dataKey="value"
          fill="url(#barColor)"
          radius={[6, 6, 0, 0]}
          animationDuration={800}
        >
          <LabelList 
            dataKey="value" 
            position="top" 
            fill="#ffffff"
            fontSize={14}
            fontWeight="bold"
          />
        </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>


      {/* Pie Chart: Ticket Type distribution */}
      <Card className="chart-container">
          <CardHeader>
            <CardTitle>Ticket Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={chartStyle}>
                  <Pie
                    data={ticketTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data, index) => handlePieClick(data, index, 'ticketType')}
                  >
                    {ticketTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      {/* Bar Chart: Status Distribution (with 3D effect) */}
      <Card className="chart-container">
        <CardHeader>
  <CardTitle className="text-2xl text-white">Ticket Status</CardTitle>
</CardHeader>
<CardContent className="h-[300px]">
  {isLoading ? (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading chart data...</p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={statusData}
        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        style={chartStyle}
        onClick={(data) => handleBarClick(data, 'status')}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 15, fill: '#ffffff' }}
        />
        <YAxis 
          tick={{ fontSize: 14, fill: '#ffffff' }}
        />

        <Bar dataKey="value" name="Tickets" radius={[6, 6, 0, 0]} animationDuration={800}>
          {statusData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              fillOpacity={0.9}
            />
          ))}
          <LabelList 
            dataKey="value" 
            position="top" 
            fill="#ffffff"
            fontSize={14}
            fontWeight="bold"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )}
</CardContent>

      </Card>

      {/* Bar Chart: Tickets by Assigned To */}
      <Card className="chart-container col-span-2 w-full">
        <CardHeader>
  <CardTitle className="text-2xl text-white">Assigned To</CardTitle>
</CardHeader>
<CardContent className="h-[500px]">
  {isLoading ? (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading chart data...</p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={assignedToData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        style={chartStyle}
        onClick={(data) => handleBarClick(data, 'assignedTo')}
      >
        <defs>
          {/* Optional gradient effect */}
          <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
            <stop offset="100%" stopColor="#1e40af" stopOpacity={0.9} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 15, fill: '#ffffff' }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis 
          tick={{ fontSize: 14, fill: '#ffffff' }}
        />

        <Bar
          dataKey="value"
          fill="url(#barColor)"
          radius={[6, 6, 0, 0]}
          animationDuration={800}
        >
          <LabelList 
            dataKey="value" 
            position="top" 
            fill="#ffffff"
            fontSize={14}
            fontWeight="bold"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )}
</CardContent>

      </Card>

    </div>
  );
};
export default Charts;