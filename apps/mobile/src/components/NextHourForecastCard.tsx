import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { FacilityForecast } from '../store/parkingStore';

interface Props {
  forecast: FacilityForecast | null;
}

export const NextHourForecastCard: React.FC<Props> = ({ forecast }) => {
  if (!forecast || !forecast.forecastPoints || forecast.forecastPoints.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading next-hour ML forecast...</Text>
      </View>
    );
  }

  const currentPct = forecast.currentMeasuredOccupancyPercentage;
  const points = forecast.forecastPoints;
  const capacity = forecast.facilityCapacity;

  // Chart Dimensions
  const chartWidth = 310;
  const chartHeight = 90;
  const paddingX = 20;
  const paddingY = 15;

  // Compute SVG Points for [Now, +15m, +30m, +45m, +60m]
  const allValues = [currentPct, ...points.map((p) => p.predictedOccupancyPercentage)];
  const minVal = Math.max(0, Math.min(...allValues) - 8);
  const maxVal = Math.min(100, Math.max(...allValues) + 8);
  const valRange = maxVal - minVal || 1;

  const svgCoords = allValues.map((val, idx) => {
    const x = paddingX + (idx / (allValues.length - 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - ((val - minVal) / valRange) * (chartHeight - 2 * paddingY);
    return { x, y, val };
  });

  // Construct SVG line and area path
  let pathD = `M ${svgCoords[0].x} ${svgCoords[0].y}`;
  for (let i = 1; i < svgCoords.length; i++) {
    pathD += ` L ${svgCoords[i].x} ${svgCoords[i].y}`;
  }
  const areaD = `${pathD} L ${svgCoords[svgCoords.length - 1].x} ${chartHeight} L ${svgCoords[0].x} ${chartHeight} Z`;

  const isIncreasing = forecast.trendDirection === 'increasing';
  const isDecreasing = forecast.trendDirection === 'decreasing';
  const trendColor = isIncreasing ? Colors.danger : isDecreasing ? Colors.success : Colors.action;

  // Expected 60-min horizon numbers
  const finalHorizon = points[points.length - 1];
  const expectedAvailable = finalHorizon.predictedAvailableSpaces;
  const expectedOccupied = finalHorizon.predictedOccupiedSpaces;

  return (
    <View style={styles.card}>
      {/* Title & Trend Banner */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.iconTag}>
            <Ionicons name="analytics" size={13} color={Colors.action} />
            <Text style={styles.badgeText}>SMARTPARK FORECASTER {forecast.modelVersion}</Text>
          </View>
          <Text style={styles.cardTitle}>Next-Hour Occupancy Forecast</Text>
        </View>

        <View style={[styles.trendBadge, { backgroundColor: isIncreasing ? '#FEF2F2' : '#ECFDF5' }]}>
          <Ionicons
            name={isIncreasing ? 'trending-up' : isDecreasing ? 'trending-down' : 'remove-outline'}
            size={14}
            color={trendColor}
          />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {forecast.trendDirection.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Honest Trend Explanation */}
      <Text style={styles.explanationText}>{forecast.trendExplanation}</Text>

      {/* SVG Line / Area Chart */}
      <View style={styles.chartContainer}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <LinearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Colors.action} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={Colors.action} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Baseline reference grid */}
          <Line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#E2E8F0"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Area Fill */}
          <Path d={areaD} fill="url(#forecastGrad)" />

          {/* Forecast Trend Line */}
          <Path d={pathD} fill="none" stroke={Colors.action} strokeWidth={3} strokeLinecap="round" />

          {/* Data Nodes */}
          {svgCoords.map((coord, idx) => (
            <Circle
              key={idx}
              cx={coord.x}
              cy={coord.y}
              r={idx === 0 || idx === svgCoords.length - 1 ? 4.5 : 3}
              fill={idx === 0 ? Colors.primary : Colors.action}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          ))}
        </Svg>

        {/* X-Axis Horizon Labels */}
        <View style={styles.xAxisRow}>
          <Text style={styles.xLabel}>Now ({currentPct}%)</Text>
          <Text style={styles.xLabel}>+15m</Text>
          <Text style={styles.xLabel}>+30m</Text>
          <Text style={styles.xLabel}>+45m</Text>
          <Text style={[styles.xLabel, { fontWeight: '700', color: Colors.primary }]}>
            +60m ({finalHorizon.predictedOccupancyPercentage}%)
          </Text>
        </View>
      </View>

      {/* Calculated Available Space Projection (Example: 500 cap -> 165 spaces) */}
      <View style={styles.projectionRow}>
        <View style={styles.projectionItem}>
          <Text style={styles.projectionLabel}>EXPECTED IN 60 MINS</Text>
          <Text style={styles.projectionValue}>
            {finalHorizon.predictedOccupancyPercentage}%{' '}
            <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.textSecondary }}>
              (~{expectedOccupied} occupied)
            </Text>
          </Text>
        </View>

        <View style={styles.projectionItemRight}>
          <Text style={styles.projectionLabel}>ESTIMATED AVAILABLE</Text>
          <Text style={[styles.projectionValue, { color: Colors.action }]}>
            ~{expectedAvailable} spaces
          </Text>
        </View>
      </View>

      {/* Uncertainty & Demo Notice */}
      <View style={styles.cardFooter}>
        <View style={styles.uncertaintyRow}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.uncertaintyText}>
            Confidence Band: ±{(finalHorizon.confidenceUpper - finalHorizon.confidenceLower).toFixed(1)}% (
            {finalHorizon.confidenceLower}% - {finalHorizon.confidenceUpper}%)
          </Text>
        </View>
        <Text style={styles.demoTag}>DEMO MODEL</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.action,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    paddingHorizontal: 4,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 2,
  },
  xLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  projectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  projectionItem: {
    flex: 1,
  },
  projectionItemRight: {
    alignItems: 'flex-end',
  },
  projectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  uncertaintyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  uncertaintyText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  demoTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.lg,
  },
});
