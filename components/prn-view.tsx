import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from "components/themed-text";
import { styles } from 'components/ui/style';
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, TextInput, View } from 'react-native';
import Modal from "react-native-modal";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { PRN, PRNTaking, addPRN, addPRNTaking, deletePRN, deletePRNTaking, getAllPRNs, getPRNTakingsByDayRecordId, updatePRN } from "src/repositories/prnRepo";

export const PRNView = ({ idDayRecord }: { idDayRecord: number }) => {
    // PRN setting
    const [prnTimeShow, setPrnTimeShow] = useState(false);  // PRN 시간 선택 모달 표시 여부
    const [prnTime, setPrnTime] = useState(new Date());     // PRN 시간 선택값
    const prnOptionPickerRef = useRef<any>(null);           // PRN 종류 선택값

    // PRN 시간 선택 모달 확인 버튼 Press
    const onConfirmPrnTime = (selectedTime: Date) => {
        setPrnTimeShow(false);
        setPrnTime(selectedTime);
    }

    // PRN 종류 배열 데이터
    const [prnData, setPrnData] = useState<PRN[]>([{ idPRN: 1, name: '필요시약' }]); // PRN데이터 리스트
    const [prnTakingData, setPrnTakingData] = useState<PRNTaking[]>([]); // PRN 복용 데이터 리스트    
    const [prnDropdownValue, setPrnDropdownValue] = useState<number>(prnData[0]?.idPRN || -1); // PRN 종류 선택값 (드롭다운에서 바뀌는 값) // prnData가 비어있을 때 에러남
    const [prnDropdownCurValue, setPrnDropdownCurValue] = useState<number>(prnData[0]?.idPRN || -1); // PRN 종류 선택값 (현재 선택되어 창에 표시되고 있는 값)
    const [prnInputText, setPrnInputText] = useState(''); // PRN 종류 입력값 (드롭다운 추가에서 입력하는 값)
    const [prnOptionEditingId, setPrnOptionEditingId] = useState<number | null>(null); // PRN 종류 설정 탭에서 종류 편집 시 편집 중인 data의 id
    const [prnOptionEditingText, setPrnOptionEditingText] = useState(''); // PRN 종류 설정 탭에서 종류 편집 시 편집 중인 data의 text
    const [prnOptionIsEditing, setPrnOptionIsEditing] = useState(false); // PRN 종류 설정 탭에서 종류 편집 중인지 여부
    const [prnSettingModalVisible, setPrnSettingModalVisible] = useState(false); // PRN 설정 모달 표시 여부
    const [prnOptionModalVisible, setPrnOptionModalVisible] = useState(false); // PRN 종류 선택 모달 표시 여부

    // DB에서 해당 날짜의 PRN 복용 기록 불러오기
    useEffect(() => {
        loadPRNList();
        loadPRNtakingList();
    }, [idDayRecord]);

    const loadPRNList = async () => {
        const dbPRNList = await getAllPRNs();
        setPrnData(dbPRNList);
    }

    const loadPRNtakingList = async () => {
        const prnTakings = await getPRNTakingsByDayRecordId(idDayRecord);
        setPrnTakingData(prnTakings);
    }

    // PRN 종류 추가 버튼 Press
    const prnOptionAddPress = () => {
        // 입력값이 없으면 추가하지 않음
        if (prnInputText.trim() === '') return;
        // 새로운 PRN 데이터 생성
        async function createNewPrnData() {
            const newPrn = new PRN(-1, prnInputText);
            // DB에 추가
            const newPrnId = await addPRN(prnInputText);
            if (newPrnId !== -1) {
                newPrn.idPRN = newPrnId;
                setPrnData((prev) => [...prev, newPrn]);
                setPrnInputText('');
            }
        }
        createNewPrnData();
        loadPRNList();
    }

    const handlePrnOptionDelete = async (id: number) => {
        if (prnOptionIsEditing) return;
        await deletePRN(id);
        await loadPRNList();
        if (prnData.length === 0) {
            setPrnDropdownValue(-1);
            setPrnDropdownCurValue(-1);
        }

    }

    const handlePrnOptionEdit = (id: number) => {

        if (prnOptionIsEditing) {
            Alert.alert("알림", '이미 편집 중인 항목이 있습니다.');
            return;
        }
        else {
            setPrnOptionIsEditing(true);
            setPrnOptionEditingId(id);
            setPrnOptionEditingText(prnData.find((item) => item.idPRN === id)?.name || '');
        }
    }

    const handlePrnOptionEditConfirm = async (id: number) => {
        if (prnOptionEditingText.trim() === '') {
            Alert.alert("알림", '편집할 내용을 입력해주세요.');
            return;
        }
        await updatePRN(id, prnOptionEditingText);
        await loadPRNList();
        setPrnOptionIsEditing(false);
        setPrnOptionEditingId(null);
        setPrnOptionEditingText('');
    }

    const prnSettingPress = () => {
        setPrnSettingModalVisible(true);
    }

    const prnSettingModalCancel = () => {
        setPrnSettingModalVisible(false);
    }

    const prnOptionPickerCancel = () => {
        setPrnOptionModalVisible(false);
    }

    const prnOptionPickerConfirm = () => {
        setPrnDropdownCurValue(prnDropdownValue);
        setPrnOptionModalVisible(false);
    }

    const prnTakingAddPress = (id: number) => {
        if (id === -1) {
            Alert.alert("알림", '필요시약을 선택해주세요.');
            return;
        }
        async function createNewPrnTaking() {
            const krTime = prnTime.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // 24시간 형식 (오후 2시 -> 14:00)
            });
            const newPrnTaking = new PRNTaking(-1, id, idDayRecord, krTime);
            const newPrnTakingId = await addPRNTaking(newPrnTaking);
            if (newPrnTakingId !== -1) {
                newPrnTaking.idPRNTaking = newPrnTakingId;
                loadPRNtakingList();
            }
        }
        createNewPrnTaking();
    }

    const prnTakingDeletePress = (id: number, takeId: number) => {
        async function deletePrnTaking() {
            await deletePRNTaking(takeId);
            loadPRNtakingList();
        }
        deletePrnTaking();
    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText>필요시 복용 약</ThemedText>
                <Pressable onPress={prnSettingPress}>
                    <Ionicons name="settings-outline" size={20} color="gray" />
                </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText>{prnData.find((item) => item.idPRN === prnDropdownCurValue)?.name}</ThemedText>
                    <Pressable onPress={() => setPrnOptionModalVisible(true)}>
                        <Ionicons name="chevron-down-outline" size={20} color="gray" />
                    </Pressable>
                </View>
                <Pressable onPress={() => setPrnTimeShow(true)} style={styles.timePressable}>
                    <Ionicons name="time-outline" size={20} color="gray" />
                    <ThemedText>{format(prnTime, 'HH:mm')}</ThemedText>
                </Pressable>
                <DateTimePickerModal
                    isVisible={prnTimeShow}
                    mode='time'
                    onConfirm={onConfirmPrnTime}
                    onCancel={() => setPrnTimeShow(false)}
                    date={prnTime}
                    locale="ko"
                    confirmTextIOS="확인"
                    cancelTextIOS="취소" />
                <Pressable onPress={() => prnTakingAddPress(prnDropdownCurValue)} style={{ justifyContent: 'flex-end' }}>
                    <ThemedText>추가</ThemedText>
                </Pressable>
            </View>
            {prnTakingData?.map((item) => (
                <React.Fragment key={item.idPRNTaking}>
                    <View key={item.idPRN + item.idPRNTaking} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ThemedText style={{ padding: 10 }}>{prnData.find((prn) => prn.idPRN === item.idPRN)?.name}</ThemedText>
                        <ThemedText style={{ padding: 10 }}>{item.takingTime}</ThemedText>
                        <Pressable onPress={() => prnTakingDeletePress(item.idPRN, item.idPRNTaking)}>
                            <ThemedText>삭제</ThemedText>
                        </Pressable>
                    </View>
                </React.Fragment>
            ))}
            <Modal isVisible={prnOptionModalVisible}
                onBackdropPress={() => prnOptionPickerCancel()}
                onModalHide={() => prnOptionPickerRef.current?.blur()}
                style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
            >
                <View style={styles.modalContainer}>
                    <Picker
                        ref={prnOptionPickerRef}
                        selectedValue={prnDropdownValue}
                        onValueChange={(value) => setPrnDropdownValue(value)}
                        mode="dropdown"
                        style={{ height: 50, width: '100%' }}
                        itemStyle={{ height: 50 }}
                        dropdownIconColor="gray"
                    >
                        {prnData?.map((item) => (
                            <Picker.Item key={item.idPRN} label={item.name} value={item.idPRN} />
                        ))}
                    </Picker>
                    <Pressable onPress={() => prnOptionPickerConfirm()}>
                        <ThemedText>확인</ThemedText>
                    </Pressable>
                </View>
            </Modal>
            <Modal isVisible={prnSettingModalVisible}
                onBackdropPress={prnSettingModalCancel}
                style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
            >
                <View style={styles.modalContainer}>
                    <ThemedText style={styles.modalTitle}>필요시약 종류</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            placeholder="필요시약 종류를 입력하세요"
                            value={prnInputText}
                            onChangeText={setPrnInputText}
                            style={styles.modalInput}
                        />
                        <Pressable onPress={prnOptionAddPress} style={{ paddingLeft: 10, marginVertical: 10 }}>
                            <ThemedText>추가</ThemedText>
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'column', width: '100%', overflow: 'scroll' }}>
                        {prnData?.map((item) => (
                            <View
                                key={item.idPRN}
                                style={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: '#eee',
                                    width: '100%'
                                }}
                            >
                                {item.idPRN === prnOptionEditingId && prnOptionIsEditing ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            placeholder={item.name}
                                            value={prnOptionEditingText}
                                            onChangeText={setPrnOptionEditingText}
                                            style={styles.modalInput}
                                        />
                                        <Pressable
                                            onPress={() => handlePrnOptionEditConfirm(item.idPRN)}>
                                            <Ionicons name="checkmark-outline" size={20} color="gray" />
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <ThemedText style={{ padding: 10, flex: 1 }}>{item.name}</ThemedText>
                                        <Pressable
                                            onPress={() => handlePrnOptionEdit(item.idPRN)}
                                            style={{ padding: 10 }}
                                        >
                                            <Ionicons name="create-outline" size={20} color="gray" />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handlePrnOptionDelete(item.idPRN)}
                                            style={{ padding: 10 }}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="gray" />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                    <Pressable onPress={prnSettingModalCancel}
                        style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: 10, marginBottom: 10 }}>
                        <ThemedText>닫기</ThemedText>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
};
