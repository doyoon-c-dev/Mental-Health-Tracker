import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { styles } from "@/components/ui/style";
import { LineChart } from 'react-native-chart-kit';
import { View } from "react-native";
import { Fonts } from '@/constants/theme';
import { DayRecord } from "@/src/repositories/recordRepo";

interface moodEmoji {
  mood: number;
  emoji: string;
  color: string;
}

const moodEmojiList: moodEmoji[] = [
  { mood: 0, emoji: "❌", color: "#ecececff" },
  { mood: 1, emoji: "☹️️", color: "#c0c0c0ff" },
  { mood: 2, emoji: "😔", color: "#808080ff" },
  { mood: 3, emoji: "😐", color: "#404040ff" },
  { mood: 4, emoji: "🙂", color: "#222222ff" },
  { mood: 5, emoji: "😀", color: "#000000ff" }
]

export const ChartWeeklyView = ({ moodData, energyData, count }: { moodData: number[], energyData: number[], count: number }) => {
  return (

    <ThemedView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 5 }}>
      <ThemedView style={styles.container}>
        <ThemedView>
          <ThemedText>이번 주 내 기분은</ThemedText>
          <ThemedText>4.5점 입니다</ThemedText>
        </ThemedView>
        <ThemedView>
          <ThemedText>기분 분포</ThemedText>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            {moodData.map((item: number, index: number) => {
              const moodEmoji = moodEmojiList.find((mood: moodEmoji) => mood.mood === item);
              return (
                <ThemedView key={index + "-" + item} style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#cececeff' }}>
                  <ThemedText>{moodEmoji?.emoji}</ThemedText>
                </ThemedView>

              )
            })}
          </ThemedView>
          <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded }}>기분 추이</ThemedText>
          <View style={{ alignItems: 'center' }}>
            {moodData.length > 0 && (
              <LineChart
                data={{ labels: ['월', '화', '수', '목', '금', '토', '일'], datasets: [{ data: moodData }] }}
                width={300}
                height={200}
                withInnerLines={false}   // 배경 가로선
                withOuterLines={false}  // 외곽선 제거
                withVerticalLines={false} // 세로선 제거
                withVerticalLabels={true} // 세로축 라벨 표시
                withHorizontalLabels={false} // 가로축 라벨 제거
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#000000ff"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 40
                }}
              />
            )}
          </View>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.container}>
        <ThemedView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 5, marginTop: 15 }}>
          <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded }}>기력 추이</ThemedText>
          <View style={{ alignItems: 'center' }}>
            {energyData.length > 0 && (
              <LineChart
                data={{
                  labels: ['월', '화', '수', '목', '금', '토', '일'],
                  datasets: [{ data: energyData }]
                }}
                width={300}
                height={200}
                withInnerLines={false}   // 배경 가로선
                withOuterLines={false}  // 외곽선 제거
                withVerticalLines={false} // 세로선 제거
                withVerticalLabels={true} // 세로축 라벨 표시
                withHorizontalLabels={false} // 가로축 라벨 제거
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#000000ff"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 40
                }}
              />
            )}
          </View>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.container}>
        <ThemedText>이번 주 기록한 횟수</ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 3 }}>
          <ThemedText style={{ fontSize: 24, fontFamily: Fonts.rounded }}>{count}회</ThemedText>
          <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded }}>/7회</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}



export const ChartMonthlyView = ({ recordData, moodData, energyData, count, numOfDays }: { recordData: DayRecord[], moodData: number[], energyData: number[], count: number, numOfDays: number }) => {
  return (
    <ThemedView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 5 }}>
      <ThemedView style={styles.container}>
        <ThemedView>
          <ThemedText>이번 주 내 기분은</ThemedText>
          <ThemedText>4.5점 입니다</ThemedText>
        </ThemedView>
        <ThemedText>기분 분포</ThemedText>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          {
            recordData.map((item: DayRecord, index: number) => {
              const moodEmoji = moodEmojiList.find((mood: moodEmoji) => mood.mood === item.mood);
              return (
                <ThemedView key={index + "-" + item} style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderRadius: 20, backgroundColor: moodEmoji?.color }} />

              )
            })
          }
        </ThemedView>
        <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded }}>기분 추이</ThemedText>
        <View style={{ alignItems: 'center' }}>
          {moodData.length > 0 && (
            <LineChart
              data={{ labels: ['1주', '2주', '3주', '4주', '5주'], datasets: [{ data: moodData }] }}
              width={300}
              height={200}
              withInnerLines={false}   // 배경 가로선
              withOuterLines={false}  // 외곽선 제거
              withVerticalLines={false} // 세로선 제거
              withVerticalLabels={true} // 세로축 라벨 표시
              withHorizontalLabels={false} // 가로축 라벨 제거
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#000000ff"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                paddingRight: 40
              }}
            />
          )}
        </View>
      </ThemedView>
      <ThemedView style={styles.container}>
        <ThemedView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 5, marginTop: 15 }}>
          <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded }}>기력 추이</ThemedText>
          <View style={{ alignItems: 'center' }}>
            {energyData.length > 0 && (
              <LineChart
                data={{
                  labels: ['1주', '2주', '3주', '4주', '5주'],
                  datasets: [{ data: energyData }]
                }}
                width={300}
                height={200}
                withInnerLines={false}   // 배경 가로선
                withOuterLines={false}  // 외곽선 제거
                withVerticalLines={false} // 세로선 제거
                withVerticalLabels={true} // 세로축 라벨 표시
                withHorizontalLabels={false} // 가로축 라벨 제거
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#000000ff"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 40
                }}
              />
            )}
          </View>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.container}>
        <ThemedText>이번 주 기록한 횟수</ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 3 }}>
          <ThemedText style={{ fontSize: 24, fontFamily: Fonts.rounded }}>{count}회</ThemedText>
          <ThemedText style={{ fontSize: 16, fontFamily: Fonts.rounded }}>/{numOfDays}회</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}