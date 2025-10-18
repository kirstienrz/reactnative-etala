import React, { useState, useMemo } from "react";
import {

View,
Text,
TouchableOpacity,
StyleSheet,
Dimensions,
} from "react-native";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const { width } = Dimensions.get("window");
const CELL_WIDTH = Math.floor(width / 7);

export default function CalendarScreen() {
const today = useMemo(() => new Date(), []);
const [displayMonth, setDisplayMonth] = useState(today.getMonth());
const [displayYear, setDisplayYear] = useState(today.getFullYear());
const [selected, setSelected] = useState(null);

const firstDayOfMonth = useMemo(
    () => new Date(displayYear, displayMonth, 1),
    [displayMonth, displayYear]
);
const startWeekday = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)
const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

const prevMonth = () => {
    if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear((y) => y - 1);
    } else {
        setDisplayMonth((m) => m - 1);
    }
};

const nextMonth = () => {
    if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear((y) => y + 1);
    } else {
        setDisplayMonth((m) => m + 1);
    }
};

const isToday = (day) =>
    day === today.getDate() &&
    displayMonth === today.getMonth() &&
    displayYear === today.getFullYear();

const renderCells = () => {
    const cells = [];
    // leading blanks
    for (let i = 0; i < startWeekday; i++) {
        cells.push(<View key={`blank-${i}`} style={styles.cell} />);
    }
    // day numbers
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `day-${d}`;
        const selectedMatch =
            selected &&
            selected.date === d &&
            selected.month === displayMonth &&
            selected.year === displayYear;
        cells.push(
            <TouchableOpacity
                key={key}
                style={[
                    styles.cell,
                    selectedMatch ? styles.selectedCell : null,
                    isToday(d) ? styles.todayCell : null,
                ]}
                onPress={() =>
                    setSelected({ date: d, month: displayMonth, year: displayYear })
                }
            >
                <Text style={[styles.dayText, selectedMatch && styles.selectedText]}>
                    {d}
                </Text>
            </TouchableOpacity>
        );
    }
    return cells;
};

return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.title}>
                <Text style={styles.titleText}>
                    {firstDayOfMonth.toLocaleString(undefined, {
                        month: "long",
                        year: "numeric",
                    })}
                </Text>
            </View>

            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
            {WEEK_DAYS.map((wd) => (
                <View key={wd} style={[styles.weekDay, { width: CELL_WIDTH }]}>
                    <Text style={styles.weekDayText}>{wd}</Text>
                </View>
            ))}
        </View>

        <View style={styles.grid}>{renderCells()}</View>

        <View style={styles.selectionInfo}>
            <Text>
                Selected:{" "}
                {selected
                    ? `${selected.date} ${new Date(
                            selected.year,
                            selected.month,
                            selected.date
                        ).toLocaleString(undefined, { month: "short" })} ${selected.year}`
                    : "None"}
            </Text>
        </View>
    </View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, paddingTop: 24, backgroundColor: "#fff" },
header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
},
navButton: {
    padding: 8,
},
navText: {
    fontSize: 24,
    color: "#333",
},
title: { flex: 1, alignItems: "center" },
titleText: { fontSize: 18, fontWeight: "600" },
weekRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    paddingBottom: 6,
    marginBottom: 6,
},
weekDay: { alignItems: "center" },
weekDayText: { fontSize: 12, color: "#666" },
grid: {
    flexDirection: "row",
    flexWrap: "wrap",
},
cell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginVertical: 2,
},
dayText: { color: "#222" },
todayCell: {
    borderWidth: 1,
    borderColor: "#2196F3",
},
selectedCell: {
    backgroundColor: "#2196F3",
},
selectedText: {
    color: "#fff",
    fontWeight: "600",
},
selectionInfo: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
},
});