import { Ionicons } from '@expo/vector-icons';
import { ChartMonthlyView, ChartWeeklyView } from 'components/chartView';
import DaySelectCalendarModal from 'components/DaySelectCalendarModal';
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { styles } from 'components/ui/style';
import { Fonts } from 'constants/theme';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayRecord, getDurationDayRecords } from 'src/repositories/recordRepo';


export default function ChartScreen() {

  const [tab, setTab] = useState('weekly');                                   //주간 or 월간 선택 state
  const [modalShow, setModalShow] = useState(false);                          // 통계 기준 날짜 선택 모달 visible state

  const [weeklyDate, setWeeklyDate] = useState(new Date().toISOString().split('T')[0]);   // 통계 기준 날짜
  const [weeklyStart, setWeeklyStart] = useState(startOfWeek(weeklyDate, { weekStartsOn: 1 })); // 주간 시작일
  const [weeklyEnd, setWeeklyEnd] = useState(endOfWeek(weeklyDate, { weekStartsOn: 1 }));       // 주간 종료일
  const [weeklyRecordData, setWeeklyRecordData] = useState<DayRecord[]>([]);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [weeklyMoodChartData, setWeeklyMoodChartData] = useState<number[]>([]);
  const [weeklyEnergyChartData, setWeeklyEnergyChartData] = useState<number[]>([]);

  const [monthlyDate, setmonthlyDate] = useState(new Date().toISOString().split('T')[0]);   // 통계 기준 날짜
  const [monthlyStart, setMonthlyStart] = useState(startOfMonth(monthlyDate));                   // 월간 시작일
  const [monthlyEnd, setMonthlyEnd] = useState(endOfMonth(monthlyDate));                         // 월간 종료일
  const [monthlyRecordData, setMonthlyRecordData] = useState<DayRecord[]>([]);
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [numMonthly, setNumMonthly] = useState<number>(31);
  const [monthlyMoodChartData, setMonthlyMoodChartData] = useState<number[]>([]);
  const [monthlyEnergyChartData, setMonthlyEnergyChartData] = useState<number[]>([]);


  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {

        let targetDates: string[] = [];
        const data = await getDurationDayRecords(monthlyStart.toISOString().split('T')[0], monthlyEnd.toISOString().split('T')[0]);

        let daysInMonth = monthlyStart;
        while (daysInMonth <= monthlyEnd) {
          targetDates.push(daysInMonth.toISOString().split('T')[0]);
          daysInMonth = addDays(daysInMonth, 1);
        }

        const fillData = targetDates.map(date => {
          const found = data.find(record => record.date === date);
          return found || new DayRecord(-1, date, 0, 0, "00:00", "00:00", "", 0, 0, 0, 0);
        })

        setMonthlyRecordData(fillData);
        setMonthlyCount(data.length);
        setNumMonthly(targetDates.length);

        let tempWeeklyMoodData: number[] = [];
        let tempWeeklyEnergyData: number[] = [];
        let tempWeeklyStart = startOfWeek(monthlyStart, { weekStartsOn: 1 });
        let tempWeeklyEnd = endOfWeek(monthlyStart, { weekStartsOn: 1 });
        while (isSameMonth(tempWeeklyEnd, monthlyEnd) || isSameMonth(tempWeeklyStart, monthlyStart)) {
          let count, sumMood, sumEnergy, AvgMood, AvgEnergy;
          sumMood = 0;
          sumEnergy = 0;
          count = 0
          AvgMood = 0;
          AvgEnergy = 0;
          for (let date = tempWeeklyStart; date <= tempWeeklyEnd; date = addDays(date, 1)) {
            const found = data.find(record => record.date === date.toISOString().split('T')[0]);
            if (found) {
              sumMood += found.mood;
              sumEnergy += found.energy;
              count += 1;
            }
          }
          if (count > 0) {
            AvgMood = sumMood / count;
            AvgEnergy = sumEnergy / count;
          }
          tempWeeklyMoodData.push(AvgMood);
          tempWeeklyEnergyData.push(AvgEnergy);

          tempWeeklyStart = addDays(tempWeeklyStart, 7);
          tempWeeklyEnd = addDays(tempWeeklyEnd, 7);

        }

        setMonthlyMoodChartData(tempWeeklyMoodData);
        setMonthlyEnergyChartData(tempWeeklyEnergyData);

      }
      loadData();
    }, [monthlyStart])
  );

  useFocusEffect(
    useCallback(() => {

      const loadData = async () => {

        const data = await getDurationDayRecords(weeklyStart.toISOString().split('T')[0], weeklyEnd.toISOString().split('T')[0]);
        let targetDates: string[] = [];
        for (let i = 1; i <= 7; i++) {
          targetDates.push(addDays(weeklyStart, i).toISOString().split('T')[0]);
        }

        const fillData = targetDates.map(date => {
          const found = data.find(record => record.date === date);
          return found || new DayRecord(-1,date, 0, 0, "00:00", "00:00", "", 0, 0, 0, 0);
        })

        setWeeklyRecordData(fillData);
        setWeeklyCount(data.length);

        const moodData = fillData.map(record => {
          return record.mood;
        })
        setWeeklyMoodChartData(moodData);

        const energyData = fillData.map(record => {
          return record.energy;
        })
        setWeeklyEnergyChartData(energyData);


      }
      loadData();
    }, [weeklyStart])
  );

  useFocusEffect(
    useCallback(() => {
      setWeeklyDate(new Date().toISOString().split('T')[0]);
      setmonthlyDate(new Date().toISOString().split('T')[0]);
    }, [])
  );



  // 주간 or 월간 선택
  const handleTabPress = (tab: string) => {
    setTab(tab);
  };

  // 통계 기준 날짜 확인 버튼 Press
  const onConfirmDate = (date: string) => {
    setModalShow(false);
    tab === "weekly" ? setWeeklyDate(date) : setmonthlyDate(date);
    tab === "weekly" ? setWeeklyStart(startOfWeek(date, { weekStartsOn: 1 })) : setMonthlyStart(startOfMonth(date));
    tab === "weekly" ? setWeeklyEnd(endOfWeek(date, { weekStartsOn: 1 })) : setMonthlyEnd(endOfMonth(date));
  }

  // 통계 기준 날짜 취소 버튼 Press
  const onCancelDate = () => {
    setModalShow(false);
  }

  //통계 기간 이전 주 or 이전 달 버튼
  const onPrevPress = () => {
    if (tab === 'weekly') {
      setWeeklyStart(addDays(weeklyStart, -7));
      setWeeklyEnd(addDays(weeklyEnd, -7));
    } else {
      setMonthlyStart(addMonths(monthlyStart, -1));
      setMonthlyEnd(addMonths(monthlyEnd, -1));
    }
  }

  //통계 기간 다음 주 or 다음 달 버튼
  const onNextPress = () => {
    if (tab === 'weekly') {
      setWeeklyStart(addDays(weeklyStart, 7));
      setWeeklyEnd(addDays(weeklyEnd, 7));
    } else {
      setMonthlyStart(addMonths(monthlyStart, 1));
      setMonthlyEnd(addMonths(monthlyEnd, 1));
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          alignItems: 'flex-start',
          gap: 5
        }}
      >
        {/* 통계 텍스트 */}
        <ThemedView style={{ flex: 1 }}>
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
            }}>
            통계
          </ThemedText>
        </ThemedView>

        {/* 주간/월간 선택 및 통계 기간 */}
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
          {/* 주간 or 월간 선택 */}
          {/* 이 뷰가 주간/월간 선택 버튼 뒤 배경 뷰 */}
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f4ff', padding: 2, borderRadius: 20 }}>
            {/* 주간 선택 버튼 */}
            <Pressable
              onPress={() => handleTabPress('weekly')}
              style={[styles.upperTabContainer, { backgroundColor: tab === 'weekly' ? '#845c91ff' : '#f4f4f4ff' }]}>
              <ThemedText
                type="title"
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.rounded,
                  color: tab === 'weekly' ? '#fff' : '#000',
                }}>
                주간
              </ThemedText>
            </Pressable>
            {/* 월간 선택 버튼 */}
            <Pressable
              onPress={() => handleTabPress('monthly')}
              style={[styles.upperTabContainer, { backgroundColor: tab === 'monthly' ? '#845c91ff' : '#f4f4f4ff' }]}>
              <ThemedText
                type="title"
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.rounded,
                  color: tab === 'monthly' ? '#fff' : '#000',
                }}>
                월간
              </ThemedText>
            </Pressable>
          </ThemedView>
          {/* 통계 기간 */}
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 4 }}>
            {/* 이전 주 or 이전 달 버튼 */}
            <Pressable onPress={() => onPrevPress()}>
              <Ionicons name="chevron-back-outline" size={20} color="black" />
            </Pressable>
            {/* 통계 기간 텍스트 */}
            <Pressable onPress={() => setModalShow(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.rounded,
                }}>
                {tab === 'weekly' ? format(weeklyStart, 'yy.MM.dd') + ' ~ ' + format(weeklyEnd, 'yy.MM.dd') : format(monthlyStart, 'yyyy-MM')}
              </ThemedText>
            </Pressable>
            {/* 다음 주 or 다음 달 버튼 */}
            <Pressable onPress={() => onNextPress()}>
              <Ionicons name="chevron-forward-outline" size={20} color="black" />
            </Pressable>
          </ThemedView>
        </ThemedView>

        {tab === "weekly"
          ?
          <ChartWeeklyView
            moodData={weeklyMoodChartData}
            energyData={weeklyEnergyChartData}
            count={weeklyCount}
          />
          :
          <ChartMonthlyView
            recordData={monthlyRecordData}
            moodData={monthlyMoodChartData}
            energyData={monthlyEnergyChartData}
            count={monthlyCount}
            numOfDays={numMonthly}
          />
        }

        {/* 날짜 선택 모달 */}
        <DaySelectCalendarModal date={weeklyDate} setModalShow={setModalShow} onConfirmDate={onConfirmDate} onCancelDate={onCancelDate} modalShow={modalShow} />
        <DaySelectCalendarModal date={monthlyDate} setModalShow={setModalShow} onConfirmDate={onConfirmDate} onCancelDate={onCancelDate} modalShow={modalShow} />
      </ScrollView>
    </SafeAreaView >
  );
}
