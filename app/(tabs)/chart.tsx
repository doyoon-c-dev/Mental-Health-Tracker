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
  const [weeklyRecordData, setWeeklyRecordData] = useState<DayRecord[]>([]); // 주간 기록 데이터
  const [weeklyCount, setWeeklyCount] = useState<number>(0); // 주간 기록 개수
  const [weeklyMoodChartData, setWeeklyMoodChartData] = useState<number[]>([]); // 주간 평균 감정 기록 데이터 (배열 길이가 주간 개수만큼 == 7)
  const [weeklyEnergyChartData, setWeeklyEnergyChartData] = useState<number[]>([]); // 주간 평균 에너지 기록 데이터 (배열 길이가 주간 개수만큼 == 7)
  const [weeklyAvgMood, setWeeklyAvgMood] = useState<number>(0); // 주간 평균 감정 기록
  const [weeklyAvgEnergy, setWeeklyAvgEnergy] = useState<number>(0); // 주간 평균 에너지 기록


  const [monthlyDate, setmonthlyDate] = useState(new Date().toISOString().split('T')[0]);   // 통계 기준 날짜
  const [monthlyStart, setMonthlyStart] = useState(startOfMonth(monthlyDate));                   // 월간 시작일
  const [monthlyEnd, setMonthlyEnd] = useState(endOfMonth(monthlyDate));                         // 월간 종료일
  const [monthlyRecordData, setMonthlyRecordData] = useState<DayRecord[]>([]); // 월간 기록 데이터
  const [monthlyCount, setMonthlyCount] = useState<number>(0); // 월간 기록 개수
  const [numMonthly, setNumMonthly] = useState<number>(31); // 월간 날짜 개수
  const [monthlyMoodChartData, setMonthlyMoodChartData] = useState<number[]>([]); // 월간 평균 감정 기록 데이터 (배열 길이가 주간 개수만큼)
  const [monthlyEnergyChartData, setMonthlyEnergyChartData] = useState<number[]>([]); // 월간 평균 에너지 기록 데이터 (배열 길이가 주간 개수만큼)
  const [monthlyAvgMood, setMonthlyAvgMood] = useState<number>(0); // 월간 평균 감정 기록
  const [monthlyAvgEnergy, setMonthlyAvgEnergy] = useState<number>(0); // 월간 평균 에너지 기록


  //월간 차트 데이터 불러오기
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {

        let targetDates: string[] = [];
        const data = await getDurationDayRecords(monthlyStart.toISOString().split('T')[0], monthlyEnd.toISOString().split('T')[0]);


        //월간 시작일 부터 종료일까지 날짜 배열 생성
        let daysInMonth = monthlyStart;
        while (daysInMonth <= monthlyEnd) {
          targetDates.push(daysInMonth.toISOString().split('T')[0]);
          daysInMonth = addDays(daysInMonth, 1);
        }

        //DB에서 가져온 데이터를 날짜 배열에 맞게 채우기.
        //날짜가 없으면 빈 DayRecord 객체를 반환.
        const fillData = targetDates.map(date => {
          const found = data.find(record => record.date === date);
          return found || new DayRecord(-1, date, 0, 0, "00:00", "00:00", "", 0, 0, 0, 0);
        })

        setMonthlyRecordData(fillData);
        //데이터의 개수 == 기록한 횟수
        setMonthlyCount(data.filter(r => r.mood > 0 || r.energy > 0).length);
        setNumMonthly(targetDates.length);

        //이번달 데이터를 주간 데이터로 변환.
        let tempWeeklyMoodData: number[] = [];
        let tempWeeklyEnergyData: number[] = [];
        let tempWeeklyStart = startOfWeek(monthlyStart, { weekStartsOn: 1 });
        let tempWeeklyEnd = endOfWeek(monthlyStart, { weekStartsOn: 1 });

        //월간 평균 감정 기록 계산.
        let monthlySumMood: number = 0;
        let monthlySumEnergy: number = 0;
        let monthlyAvgMood: number = 0;
        let monthlyAvgEnergy: number = 0;

        //월간 데이터를 주간 단위로 자르기.
        //주간 시작일 <= 월간 종료일 or 주간 종료일 >= 월간 시작일 일 때 반복.
        //이 조건은 월간 마지막 주에 포함되어야 함.(월간 마지막 주의 주간 종료일이 월간 마지막 날짜보다 클 수 있기 때문)
        while (isSameMonth(tempWeeklyEnd, monthlyEnd) || isSameMonth(tempWeeklyStart, monthlyStart)) {
          //각 주간의 평균 감정 기록 계산.
          let count: number = 0;
          let sumMood: number = 0;
          let sumEnergy: number = 0;
          let AvgMood: number = 0;
          let AvgEnergy: number = 0;

          //주간 범위 내의 날짜를 반복하면서 평균 계산.
          for (let date = tempWeeklyStart; date <= tempWeeklyEnd; date = addDays(date, 1)) {
            const found = data.find(record => record.date === date.toISOString().split('T')[0]);
            if (found && (found.mood > 0 || found.energy > 0)) {
              sumMood += found.mood;
              sumEnergy += found.energy;
              monthlySumMood += found.mood;
              monthlySumEnergy += found.energy;
              count += 1;
            }
          }
          //평균 계산
          if (count > 0) {
            AvgMood = sumMood / count;
            AvgEnergy = sumEnergy / count;
          }
          //데이터 저장
          tempWeeklyMoodData.push(AvgMood);
          tempWeeklyEnergyData.push(AvgEnergy);

          //다음 주 기간으로 설정
          tempWeeklyStart = addDays(tempWeeklyStart, 7);
          tempWeeklyEnd = addDays(tempWeeklyEnd, 7);

        }

        //월간 평균 계산
        if (monthlyCount > 0) {
          monthlyAvgMood = monthlySumMood / monthlyCount;
          monthlyAvgEnergy = monthlySumEnergy / monthlyCount;
        }

        // 이번달 평균 감정 기록 저장.
        setMonthlyAvgMood(monthlyAvgMood);
        setMonthlyAvgEnergy(monthlyAvgEnergy);

        //주간 평균 데이터 저장
        setMonthlyMoodChartData(tempWeeklyMoodData);
        setMonthlyEnergyChartData(tempWeeklyEnergyData);

      }
      loadData();
    }, [monthlyStart])
  );


  //주간 차트 데이터 불러오기
  useFocusEffect(
    useCallback(() => {

      const loadData = async () => {

        //DB에서 이번주 데이터 불러오기.
        const data = await getDurationDayRecords(weeklyStart.toISOString().split('T')[0], weeklyEnd.toISOString().split('T')[0]);

        //이번주 날짜 배열 생성.
        let targetDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          targetDates.push(addDays(weeklyStart, i).toISOString().split('T')[0]);
        }

        //이번주 데이터 저장
        const fillData = targetDates.map(date => {
          const found = data.find(record => record.date === date);
          return found || new DayRecord(-1, date, 0, 0, "00:00", "00:00", "", 0, 0, 0, 0);
        })
        setWeeklyRecordData(fillData);
        setWeeklyCount(data.filter(r => r.mood > 0 || r.energy > 0).length);

        //이번주 평균 감정 기록 계산
        let sumMood: number = 0;
        let sumEnergy: number = 0;
        let count: number = 0;
        let AvgMood: number = 0;
        let AvgEnergy: number = 0;

        fillData.forEach(record => {
          if (record.mood > 0 || record.energy > 0) {
            sumMood += record.mood;
            sumEnergy += record.energy;
            count += 1;
          }
        })

        if (count > 0) {
          AvgMood = sumMood / count;
          AvgEnergy = sumEnergy / count;
        }

        //이번주 평균 감정 기록 저장
        setWeeklyAvgMood(AvgMood);
        setWeeklyAvgEnergy(AvgEnergy);

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
            avgMood={weeklyAvgMood}
            avgEnergy={weeklyAvgEnergy}
          />
          :
          <ChartMonthlyView
            recordData={monthlyRecordData}
            moodData={monthlyMoodChartData}
            energyData={monthlyEnergyChartData}
            count={monthlyCount}
            avgMood={monthlyAvgMood}
            avgEnergy={monthlyAvgEnergy}
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
