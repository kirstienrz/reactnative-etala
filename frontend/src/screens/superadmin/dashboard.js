import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Users, UserCheck, Archive } from 'lucide-react-native';
import { getUserAnalytics } from '../../api/user';

// For charts, you'll need to install: react-native-chart-kit
// npm install react-native-chart-kit react-native-svg
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32; // Padding on both sides

const SuperAdminDashboardMobile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getUserAnalytics();
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data</Text>
          <Text style={styles.errorSubtext}>Pull down to retry</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prepare chart data
  const trendLabels = data.trend.months.map(month => {
    // Shorten month names for mobile
    const shortMonth = month.substring(0, 3);
    return shortMonth;
  });

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        data: data.trend.counts,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // User Type Data for Bar Chart
  const userTypeEntries = Object.entries(data.userType);
  const userTypeLabels = userTypeEntries.map(([name]) => name);
  const userTypeValues = userTypeEntries.map(([, value]) => value);

  const userTypeData = {
    labels: userTypeLabels,
    datasets: [
      {
        data: userTypeValues,
      },
    ],
  };

  // Department Data for Pie Chart
  const deptEntries = Object.entries(data.department);
  const deptPieData = deptEntries.map(([name, value], index) => ({
    name: name,
    population: value,
    color: getPieColor(index),
    legendFontColor: '#4B5563',
    legendFontSize: 12,
  }));

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 11,
    },
  };

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>User statistics and trends</Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.cardsContainer}>
          {/* Total Users Card */}
          <View style={[styles.card, styles.cardBlue]}>
            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Total Users</Text>
                <Text style={[styles.cardValue, styles.cardValueBlue]}>
                  {data.overview.totalUsers}
                </Text>
              </View>
              <View style={styles.cardIconContainer}>
                <Users width={40} height={40} color="#3B82F6" opacity={0.3} />
              </View>
            </View>
          </View>

          {/* Active Users Card */}
          <View style={[styles.card, styles.cardGreen]}>
            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Active Users</Text>
                <Text style={[styles.cardValue, styles.cardValueGreen]}>
                  {data.overview.activeUsers}
                </Text>
              </View>
              <View style={styles.cardIconContainer}>
                <UserCheck width={40} height={40} color="#10B981" opacity={0.3} />
              </View>
            </View>
          </View>

          {/* Archived Users Card */}
          <View style={[styles.card, styles.cardOrange]}>
            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Archived Users</Text>
                <Text style={[styles.cardValue, styles.cardValueOrange]}>
                  {data.overview.archivedUsers}
                </Text>
              </View>
              <View style={styles.cardIconContainer}>
                <Archive width={40} height={40} color="#F97316" opacity={0.3} />
              </View>
            </View>
          </View>
        </View>

        {/* Registration Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Registration Trend</Text>
          <Text style={styles.chartSubtitle}>Last 6 Months</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <LineChart
              data={trendData}
              width={Math.max(CHART_WIDTH, trendLabels.length * 60)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={true}
              withShadow={false}
              fromZero={true}
            />
          </ScrollView>
        </View>

        {/* User Type Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>User Type Distribution</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <BarChart
              data={userTypeData}
              width={Math.max(CHART_WIDTH, userTypeLabels.length * 80)}
              height={220}
              chartConfig={barChartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              fromZero={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ScrollView>

          {/* Legend for User Types */}
          <View style={styles.legendContainer}>
            {userTypeEntries.map(([name, value], index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>
                  {name}: <Text style={styles.legendValue}>{value}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Department Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Department Distribution</Text>
          
          <PieChart
            data={deptPieData}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
          />

          {/* Legend for Departments */}
          {/* <View style={styles.legendContainer}>
            {deptEntries.map(([name, value], index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getPieColor(index) }]} />
                <Text style={styles.legendText}>
                  {name}: <Text style={styles.legendValue}>{value}</Text>
                </Text>
              </View>
            ))}
          </View> */}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to generate colors for pie chart
const getPieColor = (index) => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange-red
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBlue: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardGreen: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardOrange: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  cardValueBlue: {
    color: '#3B82F6',
  },
  cardValueGreen: {
    color: '#10B981',
  },
  cardValueOrange: {
    color: '#F97316',
  },
  cardIconContainer: {
    marginLeft: 12,
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  chartScrollContent: {
    paddingRight: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  legendContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#4B5563',
  },
  legendValue: {
    fontWeight: '600',
    color: '#111827',
  },
  bottomSpacer: {
    height: 24,
  },
});

export default SuperAdminDashboardMobile;