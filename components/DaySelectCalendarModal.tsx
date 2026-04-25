import { Calendar } from "react-native-calendars";
import Modal from "react-native-modal";
import { ThemedView } from "./themed-view";
import { styles } from "./ui/style";
import { Fonts } from "@/constants/theme";
import { Pressable } from "react-native";
import { ThemedText } from "./themed-text";
import { useState } from "react";

export default function DaySelectCalendarModal({ modalShow, setModalShow, date, onConfirmDate, onCancelDate }: { modalShow: boolean, setModalShow: (modalShow: boolean) => void, date: string, onConfirmDate: (date: string) => void, onCancelDate: () => void }) {
    const [selectedDate, setSelectedDate] = useState(date);

    return (
        <Modal
            isVisible={modalShow}
            hasBackdrop={true}
            backdropColor="#000"
            backdropOpacity={0.5}
            onBackdropPress={() => setModalShow(false)}
            style={{ justifyContent: "center", alignItems: "center" }}
        >
            <ThemedView style={styles.modalContainer}>
                <Calendar
                    current={selectedDate}
                    onDayPress={(day) => {
                        setSelectedDate(day.dateString);
                    }}
                    markedDates={{
                        [selectedDate]: { selected: true, selectedColor: '#845c91ff' },
                    }}
                    theme={{
                        backgroundColor: '#fff',
                        calendarBackground: '#fff',
                        textSectionTitleColor: '#b6b6b6',
                        selectedDayBackgroundColor: '#845c91ff',
                        selectedDayTextColor: '#fff',
                        todayTextColor: '#845c91ff',
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        dotColor: '#845c91ff',
                        selectedDotColor: '#fff',
                        arrowColor: '#845c91ff',
                        monthTextColor: '#845c91ff',
                        textDayFontFamily: Fonts.rounded,
                        textMonthFontFamily: Fonts.rounded,
                        textDayHeaderFontFamily: Fonts.rounded,
                    }}
                />
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                    <Pressable onPress={() => { onConfirmDate(selectedDate) }} style={styles.modalButton}>
                        <ThemedText>확인</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => { onCancelDate() }} style={styles.modalButton}>
                        <ThemedText>취소</ThemedText>
                    </Pressable>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}