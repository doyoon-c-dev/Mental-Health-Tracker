import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { PRNView } from 'components/prn-view'; //필요시약 컴포넌트
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { styles } from 'components/ui/style';
import { Fonts } from 'constants/theme';
import { format, parse } from 'date-fns';
import Checkbox from 'expo-checkbox';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayRecord, getDayRecordByDate, updateDayRecord } from 'src/repositories/recordRepo';
import { getRegularMedicineSetting, RegularMedicineSetting, updateRegularMedicineSetting } from 'src/repositories/regularMedicineSettingRepo';

export default function RecordScreen() {

  const [dayRecord, setDayRecord] = useState<DayRecord>(new DayRecord(-1, format(new Date(), 'yyyy-MM-dd'), 0, 0, "08:00", "23:00", "", 0, 0, 0, 0));
  const [medicineSetting, setMedicineSetting] = useState<RegularMedicineSetting>(new RegularMedicineSetting());
  const [dateShow, setDateShow] = useState(false); // 날짜 선택 모달
  const [timeShow, setTimeShow] = useState(false); // 시간 선택 모달

  // 정기 약 복용 설정 로드
  const loadingRegularMedicineSetting = async (dateString: string) => {
    const medicineSettingDataDB: RegularMedicineSetting[] = await getRegularMedicineSetting();
    const medicineSettingSorted = medicineSettingDataDB.sort((a, b) => a.historyDate.localeCompare(b.historyDate)); // 날짜순 정렬
    const matched = medicineSettingSorted.find((item) => item.historyDate === dateString); // 해당 날짜와 일치하는 데이터 찾기
    if (matched) { //일치하는 데이터가 있으면 해당 데이터로 로드
      setMedicineSetting(matched);
    }
    else { //없으면 가장 최근 데이터로 로드 // 기본설정 1개밖에 없는 경우 0번째를 로딩
      setMedicineSetting(medicineSettingSorted[medicineSettingSorted.length - 1]);
    }
  }

  // 하루기록 데이터 로드
  const loadingDayRecord = async (dateString: string) => {
    const dayRecordDataDB: DayRecord | -1 = await getDayRecordByDate(dateString);
    if (dayRecordDataDB !== -1) {
      setDayRecord(dayRecordDataDB);
    }
    else { console.error("하루 기록 데이터 로드 실패");  }
    
    return dayRecordDataDB;
  }

  //하루기록 데이터 저장
  const saveCurrentData = async() => {
        await updateRegularMedicineSetting(medicineSetting, dayRecord.date);
        await updateDayRecord(dayRecord);
  }

  // 앱 시작 시 오늘 날짜로 데이터 로드
  useEffect(() => {
    const dateString = new Date().toISOString().split('T')[0];
    async function loadingData() {
      await updateRegularMedicineSetting(medicineSetting, dateString);
      await loadingRegularMedicineSetting(dateString);
      await loadingDayRecord(dateString);
    }

    loadingData();
    

    return () => {
      saveCurrentData();
    }
  }, []);

  // 정기 약 복용 설정 바뀔 때마다 저장
  useEffect(() => {
    updateRegularMedicineSetting(medicineSetting, dayRecord.date);
  }, [medicineSetting]);

  // 기분 데이터
  const MOOD_DATA = [
    { id: 1, name: '우울함', emoji: '😞', color: '#FFCDD2' },
    { id: 2, name: '처짐', emoji: '🙁', color: '#cddfffff' },
    { id: 3, name: '평범', emoji: '😐', color: '#cdffe2ff' },
    { id: 4, name: '괜찮음', emoji: '😊', color: '#fff9cdff' },
    { id: 5, name: '좋음', emoji: '😀', color: '#f2cdffff' },
  ];

  //선택된 기분, 선택된 에너지, 정기 약 복용 데이터, 정기 약 복용 편집 모드, 선택된 정기 약 ID(확인용)
  const [isMedicineEditing, setIsMedicineEditing] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [selectedMedicineTime, setSelectedMedicineTime] = useState<string | null>(null);
  const [wakeUpTimeShow, setWakeUpTimeShow] = useState(false);
  const [sleepTimeShow, setSleepTimeShow] = useState(false);

  // 전체 기록 날짜 확인 버튼 Press
  const onConfirmDate = async (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().slice(0, 10);
    setDateShow(false);

    try {
      await loadingRegularMedicineSetting(dateString);
      const dayRecordData = await loadingDayRecord(dateString);
      if (dayRecordData !== -1) {
        await updateDayRecord(dayRecordData);
      }
      await saveCurrentData();
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }

  // 정기 약 복용 알람 시간 설정 확인 버튼 Press
  const onConfirmTime = (selectedTime: Date) => {
    setTimeShow(false);

    const timeString = selectedTime.toISOString().slice(0, 10);
    setSelectedMedicineTime(timeString);

    if (selectedMedicineId === 1) {
      setMedicineSetting((prev) => ({
        ...prev,
        morningAlarmTime: timeString,
      }))
    }
    else if (selectedMedicineId === 2) {
      setMedicineSetting((prev) => ({
        ...prev,
        lunchAlarmTime: timeString,
      }))
    }
    else if (selectedMedicineId === 3) {
      setMedicineSetting((prev) => ({
        ...prev,
        dinnerAlarmTime: timeString,
      }))
    }
    else if (selectedMedicineId === 4) {
      setMedicineSetting((prev) => ({
        ...prev,
        beforeSleepAlarmTime: timeString,
      }))
    }
    else {
      return;
    }
  }

  // 기분 선택 버튼 Press
  const moodPress = (id: number) => {
    if (dayRecord.mood === id) {
      setDayRecord({ ...dayRecord, mood: 0 });
      return;
    }
    setDayRecord({ ...dayRecord, mood: id });
  }

  // 정기 약 복용 버튼 Press (ex. 복용 -> 미복용)
  const medicinePress = (index: number) => {
    setDayRecord((prev) => {
      if (index === 0) {
        return { ...prev, morningTaken: prev.morningTaken === 0 ? 1 : 0 };
      }
      else if (index === 1) {
        return { ...prev, lunchTaken: prev.lunchTaken === 0 ? 1 : 0 };
      }
      else if (index === 2) {
        return { ...prev, dinnerTaken: prev.dinnerTaken === 0 ? 1 : 0 };
      }
      else if (index === 3) {
        return { ...prev, beforeSleepTaken: prev.beforeSleepTaken === 0 ? 1 : 0 };
      }

      return prev;
    })
  }

  // 정기 약 복용 표시 버튼 Press (ex. 표시 -> 미표시)
  const medicineUsingPress = (id: number) => {

    setMedicineSetting((prev) => {
      if (id === 0) {
        return { ...prev, morningUsing: prev.morningUsing === 0 ? 1 : 0 }
      }
      else if (id === 1) {
        return { ...prev, lunchUsing: prev.lunchUsing === 0 ? 1 : 0 }
      }
      else if (id === 2) {
        return { ...prev, dinnerUsing: prev.dinnerUsing === 0 ? 1 : 0 }
      }
      else if (id === 3) {
        return { ...prev, beforeSleepUsing: prev.beforeSleepUsing === 0 ? 1 : 0 }
      }
      return prev;
    })
  }

  // 정기 약 복용 알람 여부 버튼 Press
  const medicineAlarmOnPress = (id: number) => {
    setMedicineSetting((prev) => {
      if (id === 0) {
        return { ...prev, morningAlarmOn: prev.morningAlarmOn === 0 ? 1 : 0 }
      }
      else if (id === 1) {
        return { ...prev, lunchAlarmOn: prev.lunchAlarmOn === 0 ? 1 : 0 }
      }
      else if (id === 2) {
        return { ...prev, dinnerAlarmOn: prev.dinnerAlarmOn === 0 ? 1 : 0 }
      }
      else if (id === 3) {
        return { ...prev, beforeSleepAlarmOn: prev.beforeSleepAlarmOn === 0 ? 1 : 0 }
      }
      return prev;
    })
  };

  // 정기 약 복용 편집 버튼 Press
  const medicineEditPress = () => {
    setIsMedicineEditing(!isMedicineEditing);
  }

  // 기상 시간 확인 버튼 Press
  const onConfirmWakeUpTime = (selectedTime: Date) => {
    setWakeUpTimeShow(false);
    setDayRecord({ ...dayRecord, wakeUpTime: format(selectedTime, "HH:mm") });
  }

  // 취침 시간 확인 버튼 Press
  const onConfirmSleepTime = (selectedTime: Date) => {
    setSleepTimeShow(false);
    setDayRecord({ ...dayRecord, sleepTime: format(selectedTime, "HH:mm") });
  }

  // 문자열을 시간으로 변환
  const stringToTime = (time: string) => {
    const date = parse(dayRecord.date, "yyyy-MM-dd", new Date());
    return parse(time, 'HH:mm', date);
  }

  // 정기 약 복용 컴포넌트
  const regularMedicineComponent = (when: string) => {

    let value, index, whenString, alarmOn, alarmTime;
    if (when === 'morning') {
      value = dayRecord.morningTaken;
      index = 0;
      whenString = '아침약';
      alarmOn = medicineSetting.morningAlarmOn;
      alarmTime = medicineSetting.morningAlarmTime;
    }
    else if (when === 'lunch') {
      value = dayRecord.lunchTaken;
      index = 1;
      whenString = '점심약';
      alarmOn = medicineSetting.lunchAlarmOn;
      alarmTime = medicineSetting.lunchAlarmTime;
    }
    else if (when === 'dinner') {
      value = dayRecord.dinnerTaken;
      index = 2;
      whenString = '저녁약';
      alarmOn = medicineSetting.dinnerAlarmOn;
      alarmTime = medicineSetting.dinnerAlarmTime;
    }
    else {
      value = dayRecord.beforeSleepTaken;
      index = 3;
      whenString = '취침전약';
      alarmOn = medicineSetting.beforeSleepAlarmOn;
      alarmTime = medicineSetting.beforeSleepAlarmTime;
    }

    return (
      <Pressable
        style={({ pressed }) =>
          [styles.medicineContainer,
          value === 1 && { backgroundColor: 'rgb(213, 215, 254)' }
          ]}
        onPress={() => medicinePress(index)}
        key={index}
      >
        {/* 정기 약 복용 이름 */}
        <ThemedText>{whenString}</ThemedText>
        {/* 정기 약 복용 복용 상태 */}
        <ThemedText>{value === 1 ? '복용' : '미복용'}</ThemedText>
        {/* 정기 약 복용 시간 표시 */}
        {alarmOn === 1 && <ThemedText style={{ textAlign: 'right' }}>{alarmTime}</ThemedText>}
      </Pressable>
    )
  }

  // 정기 약 복용 편집 컴포넌트
  const regularMedicineEditComponent = (when: string) => {
    let UsingValue, AlarmOnValue, AlarmTimeValue, index, whenString;

    if (when === 'morning') {
      UsingValue = medicineSetting.morningUsing;
      AlarmOnValue = medicineSetting.morningAlarmOn;
      AlarmTimeValue = medicineSetting.morningAlarmTime;
      index = 0;
      whenString = '아침약';
    }
    else if (when === 'lunch') {
      UsingValue = medicineSetting.lunchUsing;
      AlarmOnValue = medicineSetting.lunchAlarmOn;
      AlarmTimeValue = medicineSetting.lunchAlarmTime;
      index = 1;
      whenString = '점심약';
    }
    else if (when === 'dinner') {
      UsingValue = medicineSetting.dinnerUsing;
      AlarmOnValue = medicineSetting.dinnerAlarmOn;
      AlarmTimeValue = medicineSetting.dinnerAlarmTime;
      index = 2;
      whenString = '저녁약';
    }
    else {
      UsingValue = medicineSetting.beforeSleepUsing;
      AlarmOnValue = medicineSetting.beforeSleepAlarmOn;
      AlarmTimeValue = medicineSetting.beforeSleepAlarmTime;
      index = 3;
      whenString = '취침전약';
    }

    return (
      <View style={styles.medicineContainer} key={whenString}>
        {/* 정기 약 복용 사용 버튼 */}
        <ThemedText style={{ fontSize: 17, fontFamily: Fonts.rounded }}>{whenString}</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            key={'using' + index}
            style={styles.checkboxContainer}
            value={UsingValue === 1 ? true : false}
            onValueChange={() => medicineUsingPress(index)}
            color={UsingValue ? '#4630EB' : '#ccc'}
          />
          <ThemedText style={{ fontSize: 17, fontFamily: Fonts.rounded }}>복용함</ThemedText>
        </View>
        {/* 정기 약 복용 알람 사용 여부 버튼 */}
        <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
          <Checkbox
            key={'alarm' + index}
            style={styles.checkboxContainer}
            value={AlarmOnValue === 1 ? true : false}
            onValueChange={() => medicineAlarmOnPress(index)}
            color={AlarmOnValue ? '#4630EB' : '#ccc'}
          />
          <ThemedText style={{ fontSize: 17, fontFamily: Fonts.rounded }}>알람 설정</ThemedText>
        </View>
        {/* 정기 약 복용 알람 시간 선택 버튼 */}
        <Pressable
          key={'time' + index}
          style={styles.timePressable}
          onPress={() => {
            setSelectedMedicineId(index);
            setTimeShow(true);
          }}>
          <Ionicons name="time-outline" size={20} color="gray" />
          <ThemedText>{AlarmTimeValue}</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffffe3' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20
        }}
      >
        <KeyboardAwareScrollView
          extraScrollHeight={100}
          enableOnAndroid={true}
          keyboardShouldPersistTaps='handled'
          style={{ flex: 1 }}
        >
          <ThemedView style={{ flex: 1, flexDirection: 'column', paddingHorizontal: 4, paddingTop: 4 }}>
            {/* 상단 헤더 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText
                type="title"
                style={{
                  fontSize: 32,
                  fontFamily: Fonts.rounded,
                  paddingVertical: 5
                }}>
                하루 기록
              </ThemedText>
            </View>

            {/* 날짜 선택 */}
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 10, paddingHorizontal: 4 }}>
              <Pressable onPress={() => setDateShow(true)} style={{ flexDirection: 'row' }}>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.rounded,
                  }}>
                  {dayRecord.date}
                </ThemedText>
                <Ionicons style={{ marginLeft: 4 }} name="calendar-outline" size={20} color="black" />
              </Pressable>
            </ThemedView>

            {/* 기분 선택 */}
            <View style={styles.container}>
              <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded, paddingVertical: 5, marginBottom: 10 }}>오늘의 상태</ThemedText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {MOOD_DATA.map((item) => {
                  const isSelected = dayRecord.mood === item.id;
                  return (
                    <Pressable style={({ pressed }) => [styles.emotionPressable,
                    isSelected && { backgroundColor: item.color, borderWidth: 0.2, borderColor: item.color }]} onPress={() => moodPress(item.id)} key={item.id}>
                      <ThemedText style={{ fontSize: 20 }}>{item.emoji}</ThemedText>
                      <ThemedText style={{ fontSize: 12 }}>{item.name}</ThemedText>
                    </Pressable>)
                })
                }
              </View>

              {/* 에너지 선택 */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded, marginHorizontal: 5, marginTop: 15 }}>기력</ThemedText>
                <Slider
                  style={{ width: "70%", height: 40, marginTop: 15}}
                  minimumValue={1}
                  maximumValue={5}
                  step={1}
                  value={dayRecord.energy}
                  onValueChange={(value) => setDayRecord({ ...dayRecord, energy: value })}
                />
                <ThemedText style={{ fontSize: 20, fontFamily: Fonts.rounded, marginTop: 15, marginLeft: 5 }}>{dayRecord.energy}/5점</ThemedText>
              </View>
            </View>

            {/* 정기 약 복용 */}
            <View style={styles.container}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <ThemedText>정기 약 복용</ThemedText>

                {/* 정기 약 복용 편집 버튼 */}
                <Pressable onPress={medicineEditPress}>
                  <ThemedText>일정 관리</ThemedText>
                </Pressable>
              </View>
              {/* 정기 약 복용 리스트 */}
              <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 12, width: "100%" }}>
                {/* 정기 약 복용 편집 모드 */}
                {isMedicineEditing &&
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {regularMedicineEditComponent('morning')}
                    {regularMedicineEditComponent('lunch')}
                    {regularMedicineEditComponent('dinner')}
                    {regularMedicineEditComponent('beforeSleep')}
                  </View>
                }
                {/* 정기 약 복용 표시 모드 */}
                {!isMedicineEditing &&
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {medicineSetting.morningUsing === 1 && regularMedicineComponent('morning')}
                    {medicineSetting.lunchUsing === 1 && regularMedicineComponent('lunch')}
                    {medicineSetting.dinnerUsing === 1 && regularMedicineComponent('dinner')}
                    {medicineSetting.beforeSleepUsing === 1 && regularMedicineComponent('beforeSleep')}
                  </View>
                }
              </View>
            </View>
            {/* PRN 복용 */}
            <PRNView idDayRecord={dayRecord.id}/>

            {/* 기록 및 수면 */}
            <ThemedView style={styles.container}>
              <View style={{ flexDirection: 'column', gap: 10 }}>
                <ThemedText>기록 및 수면</ThemedText>
                <View style={{ flexDirection: 'row', paddingHorizontal: 4, justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={[styles.container, { width: '45%', gap: 10 }]}>
                    <ThemedText>취침 시간</ThemedText>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <Pressable style={styles.timePressable} onPress={() => setSleepTimeShow(true)}>
                        <Ionicons name="time-outline" size={20} color="gray" />
                        <ThemedText>{dayRecord.sleepTime}</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                  <View style={[styles.container, { width: '45%', gap: 10 }]}>
                    <ThemedText>기상 시간</ThemedText>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <Pressable style={styles.timePressable} onPress={() => setWakeUpTimeShow(true)}>
                        <Ionicons name="time-outline" size={20} color="gray" />
                        <ThemedText>{dayRecord.wakeUpTime}</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View style={[styles.container, { width: '100%', height: 100 }]}>
                  <TextInput placeholder="오늘 하루 기록..." />
                </View>
              </View>
            </ThemedView>
          </ThemedView>
        </KeyboardAwareScrollView>
      </ScrollView>
      {/* 날짜 선택 모달 */}
      <DateTimePickerModal
        isVisible={dateShow}
        mode='date'
        onConfirm={onConfirmDate}
        onCancel={() => setDateShow(false)}
        date={new Date(dayRecord.date)}
        locale="ko"
        confirmTextIOS="확인"
        cancelTextIOS="취소" />
      {/* 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={timeShow}
        mode="time"
        onConfirm={onConfirmTime}
        onCancel={() => setTimeShow(false)}
        date={selectedMedicineTime ? stringToTime(selectedMedicineTime) : new Date()}
        locale="ko"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
      {/* 기상 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={wakeUpTimeShow}
        mode="time"
        onConfirm={onConfirmWakeUpTime}
        onCancel={() => setWakeUpTimeShow(false)}
        date={stringToTime(dayRecord.wakeUpTime)}
        locale="ko"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
      {/* 취침 시간 선택 모달 */}
      <DateTimePickerModal
        isVisible={sleepTimeShow}
        mode="time"
        onConfirm={onConfirmSleepTime}
        onCancel={() => setSleepTimeShow(false)}
        date={stringToTime(dayRecord.sleepTime)}
        locale="ko"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />
    </SafeAreaView >
  );
}