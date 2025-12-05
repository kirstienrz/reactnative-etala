import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import {
  FileDown,
  FileSpreadsheet,
  Calendar,
  Filter,
  ChartPie,
  Users,
  Briefcase,
  ClipboardList,
  Download,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

const Exports = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "",
    status: "",
  });

  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reportTypes = [
    "GAD Suggestions",
    "User Activities",
    "Incident / Report Management",
    "Referral & Assignment",
    "Budget & Programs",
    "Projects Overview",
    "Messaging Logs",
    "Knowledge Hub Upload Logs",
  ];

  const exportData = [
    {
      title: "User Management",
      description: "All users, roles, status, and registration logs.",
      icon: Users,
      iconColor: "#3b82f6",
      available: true,
    },
    {
      title: "GAD Suggestion Analytics",
      description: "Suggestion trends, approval rates, priorities.",
      icon: ChartPie,
      iconColor: "#ec4899",
      available: true,
    },
    {
      title: "Projects & Programs",
      description: "Project progress, budgets, timelines.",
      icon: Briefcase,
      iconColor: "#047857",
      available: true,
    },
    {
      title: "Incident & Report Management",
      description: "Reports, actions taken, status updates.",
      icon: ClipboardList,
      iconColor: "#6366f1",
      available: true,
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      reportType: "",
      status: "",
    });
  };

  const handleExport = async (format) => {
    if (!filters.reportType) {
      Alert.alert("Export Error", "Please select a report type first.");
      return;
    }

    setIsLoading(true);
    setSelectedFormat(format);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real application, this would trigger the actual download
      console.log(`Exporting ${filters.reportType} as ${format}`, filters);
      Alert.alert(
        "Export Started",
        `Exporting ${filters.reportType} as ${format}...`
      );
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Export failed. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedFormat("");
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== ""
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Export Reports</Text>
          <Text style={styles.subtitle}>
            Download system-generated reports for documentation, analysis, and
            compliance.
          </Text>
        </View>

        {/* Filters Section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.filterHeader}
            onPress={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <View style={styles.filterTitleContainer}>
              <Filter size={18} color="#374151" />
              <Text style={styles.filterTitle}>Filter Reports</Text>
            </View>
            <View style={styles.filterHeaderRight}>
              {hasActiveFilters && (
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterText}>Active filters</Text>
                </View>
              )}
              {isFilterExpanded ? (
                <ChevronUp size={18} color="#374151" />
              ) : (
                <ChevronDown size={18} color="#374151" />
              )}
            </View>
          </TouchableOpacity>

          {isFilterExpanded && (
            <View style={styles.filterContent}>
              {/* Date Range */}
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Start Date</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.startDate}
                    onChangeText={(text) => handleFilterChange("startDate", text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>End Date</Text>
                  <TextInput
                    style={styles.input}
                    value={filters.endDate}
                    onChangeText={(text) => handleFilterChange("endDate", text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Report Type */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Report Type</Text>
                <View style={styles.selectWrapper}>
                  <TextInput
                    style={styles.select}
                    value={filters.reportType}
                    onChangeText={(text) =>
                      handleFilterChange("reportType", text)
                    }
                    placeholder="Select Type"
                    placeholderTextColor="#9ca3af"
                  />
                  <ChevronDown size={18} color="#6b7280" />
                </View>
              </View>

              {/* Status */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.selectWrapper}>
                  <TextInput
                    style={styles.select}
                    value={filters.status}
                    onChangeText={(text) => handleFilterChange("status", text)}
                    placeholder="All Status"
                    placeholderTextColor="#9ca3af"
                  />
                  <ChevronDown size={18} color="#6b7280" />
                </View>
              </View>

              {/* Filter Actions */}
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                >
                  <X size={16} color="#4b5563" />
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Export Format Cards */}
        <View style={styles.formatsContainer}>
          {/* PDF Card */}
          <View style={[styles.formatCard, styles.pdfCard]}>
            <View style={styles.formatCardHeader}>
              <FileDown size={36} color="#2563eb" />
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            </View>
            <Text style={styles.formatTitle}>Export as PDF</Text>
            <Text style={styles.formatDescription}>
              Download a formatted PDF report with charts and professional layout.
            </Text>
            <TouchableOpacity
              style={[
                styles.exportButton,
                isLoading && selectedFormat === "PDF"
                  ? styles.pdfButtonDisabled
                  : styles.pdfButton,
              ]}
              onPress={() => handleExport("PDF")}
              disabled={isLoading && selectedFormat === "PDF"}
            >
              {isLoading && selectedFormat === "PDF" ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.exportButtonText}>Exporting...</Text>
                </>
              ) : (
                <>
                  <Download size={18} color="#ffffff" />
                  <Text style={styles.exportButtonText}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Excel Card */}
          <View style={[styles.formatCard, styles.excelCard]}>
            <FileSpreadsheet size={36} color="#16a34a" />
            <Text style={styles.formatTitle}>Export as Excel</Text>
            <Text style={styles.formatDescription}>
              Download an Excel file with raw data for detailed analysis and
              processing.
            </Text>
            <TouchableOpacity
              style={[
                styles.exportButton,
                isLoading && selectedFormat === "Excel"
                  ? styles.excelButtonDisabled
                  : styles.excelButton,
              ]}
              onPress={() => handleExport("Excel")}
              disabled={isLoading && selectedFormat === "Excel"}
            >
              {isLoading && selectedFormat === "Excel" ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.exportButtonText}>Exporting...</Text>
                </>
              ) : (
                <>
                  <Download size={18} color="#ffffff" />
                  <Text style={styles.exportButtonText}>Download Excel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* CSV Card */}
          <View style={[styles.formatCard, styles.csvCard]}>
            <ClipboardList size={36} color="#ca8a04" />
            <Text style={styles.formatTitle}>Export as CSV</Text>
            <Text style={styles.formatDescription}>
              Download raw data in CSV format for analytics and external
              documentation.
            </Text>
            <TouchableOpacity
              style={[
                styles.exportButton,
                isLoading && selectedFormat === "CSV"
                  ? styles.csvButtonDisabled
                  : styles.csvButton,
              ]}
              onPress={() => handleExport("CSV")}
              disabled={isLoading && selectedFormat === "CSV"}
            >
              {isLoading && selectedFormat === "CSV" ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.exportButtonText}>Exporting...</Text>
                </>
              ) : (
                <>
                  <Download size={18} color="#ffffff" />
                  <Text style={styles.exportButtonText}>Download CSV</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Data Sections */}
        <View style={[styles.card, styles.dataCard]}>
          <Text style={styles.sectionTitle}>Available Data for Export</Text>

          <View style={styles.dataGrid}>
            {exportData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dataItem,
                  item.available
                    ? styles.dataItemAvailable
                    : styles.dataItemDisabled,
                ]}
                disabled={!item.available}
              >
                <View style={styles.dataItemContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${item.iconColor}15` },
                    ]}
                  >
                    <item.icon
                      size={24}
                      color={item.available ? item.iconColor : "#9ca3af"}
                    />
                  </View>
                  <View style={styles.dataItemText}>
                    <View style={styles.dataItemHeader}>
                      <Text style={styles.dataItemTitle}>{item.title}</Text>
                      {!item.available && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>Coming Soon</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.dataItemDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Reports Generated Today</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Total This Month</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Most Used Format: PDF</Text>
          </View>
        </View>

        {/* Bottom Spacer - Prevents content from being hidden behind navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90, // Extra bottom padding for navigation
  },
  bottomSpacer: {
    height: 60, // Additional spacer to ensure content isn't hidden
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  filterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  filterHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeFilterBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  filterContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  selectWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  select: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  formatsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  formatCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pdfCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  excelCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  csvCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ca8a04",
  },
  formatCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  recommendedBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  formatDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 8,
  },
  pdfButton: {
    backgroundColor: "#2563eb",
  },
  pdfButtonDisabled: {
    backgroundColor: "#60a5fa",
  },
  excelButton: {
    backgroundColor: "#16a34a",
  },
  excelButtonDisabled: {
    backgroundColor: "#4ade80",
  },
  csvButton: {
    backgroundColor: "#ca8a04",
  },
  csvButtonDisabled: {
    backgroundColor: "#fbbf24",
  },
  exportButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  dataCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  dataGrid: {
    gap: 12,
  },
  dataItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  dataItemAvailable: {
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  dataItemDisabled: {
    borderColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
  },
  dataItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  dataItemText: {
    flex: 1,
  },
  dataItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  dataItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  comingSoonBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 12,
    color: "#6b7280",
  },
  dataItemDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  statCardBlue: {
    backgroundColor: "#dbeafe",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  statCardGreen: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
    borderWidth: 1,
  },
  statCardPurple: {
    backgroundColor: "#f3e8ff",
    borderColor: "#e9d5ff",
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default Exports;