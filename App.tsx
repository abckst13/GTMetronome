import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { Capability, Event, PlaybackState } from 'react-native-track-player';

const App: React.FC = () => {
  const [bpm, setBpm] = useState<number>(60); // Beats per minute
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stateChangeListener, setStateChangeListener] = useState<any>(null);
  const [trackChangeListener, setTrackChangeListener] = useState<any>(null);
  const [activeBox, setActiveBox] = useState<number>(-1); // 현재 활성화된 박스의 인덱스를 저장
  const [activeBoxCount, setActiveBoxCount] = useState<number>(1);
  const [beatBoxCount, setBeatBoxCount] = useState<number>(1);
    
  const toggleActiveBoxCount = (count: number) => {
    setActiveBoxCount(count);
    setBeatBoxCount(count);
    setActiveBox(-1);
    setIsPlaying(false);
  };

  useEffect(() => {
    const setupPlayerAndMetronome = async () => {
      await setupPlayer();
    };

    setupPlayerAndMetronome();

    return () => {
      TrackPlayer.reset();
      if (stateChangeListener) {
        stateChangeListener.remove();
      }
      if (trackChangeListener) {
        trackChangeListener.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    } else {
      stopMetronome();
    }
  }, [bpm, isPlaying]);

  useEffect(() => {
    const onStateChange = (state: PlaybackState): void => {
      if (state.state === "playing") {
        setActiveBox(prevBox => 
          (prevBox + 1) % beatBoxCount); // 현재 박스의 인덱스를 변경
      }
    };

    const onTrackChanged = async (data: any) => {
      const trackId = data.nextTrack;
      if (trackId === 'tick') {
        await TrackPlayer.seekTo(0);
        await TrackPlayer.play();
      }
    };

    const stateChangeListener = TrackPlayer.addEventListener(Event.PlaybackState, onStateChange);
    const trackChangeListener = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, onTrackChanged);

    setStateChangeListener(stateChangeListener);
    setTrackChangeListener(trackChangeListener);

    return () => {
      stateChangeListener.remove();
      trackChangeListener.remove();
    };
  }, [beatBoxCount]);

  const setupPlayer = async (): Promise<void> => {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.add({
      id: 'tick',
      url: require('./assets/tick.mp3'),
      title: 'Tick',
      audioQuality: 'High', 
      artist: 'Metronome',
      numberOfLoops: -1, // 무한 반복 설정
    });
    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo
      ],
    });
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
    });
  };

  const startMetronome = async (): Promise<void> => {
    // const beatDuration = 60 / bpm; // 한 박자당 걸리는 시간(초)
    // const playbackRate = 1 / beatDuration; // 초당 재생 속도
    // setActiveBox(-1);
    // await TrackPlayer.seekTo(0);
    // await TrackPlayer.setRate(playbackRate);
    // await TrackPlayer.play();
    // setIsPlaying(true);

    const beatDuration = 60 / bpm; // 한 박자당 걸리는 시간(초)
    const beatInterval = beatDuration / beatBoxCount; // 1 BPM을 3박자로 나눈 간격
    const playbackRate = 1 / beatInterval; // 초당 재생 속도
    // setActiveBox(-1);
    await TrackPlayer.seekTo(0);
    await TrackPlayer.setRate(playbackRate);
    await TrackPlayer.play();
    setIsPlaying(true);
  };

  const stopMetronome = async (): Promise<void> => {
    await TrackPlayer.pause();
    setActiveBox(-1);
    setIsPlaying(false);
  };

  const toggleMetronome = (): void => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const increaseBpm = (): void => {
    stopMetronome();
    setActiveBox(-1);
    setBpm((prev) => Math.min(prev + 1, 300));
  }
  const decreaseBpm = (): void => {
    stopMetronome();
    setActiveBox(-1);
    setBpm((prev) => Math.max(prev - 1, 30));
  }

  return (
    <View style={styles.container}>
      <View style={styles.borderContainer}> 
        {/* 각 박스의 색을 activeBox에 따라 동적으로 설정 */}
        {[...Array(activeBoxCount)].map((_, index) => (
        <View key={index} style={[styles.subBox, index === activeBox ? styles.activeBox : null]}>
          <Text style={styles.text}>V</Text>
        </View>
      ))}

      </View>
      <View style={styles.itemContainer}>
        <View style={styles.item}>
          <Text style={styles.bpmText}>{bpm} BPM</Text>
        </View>
        <View style={styles.item}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={decreaseBpm} style={styles.button}>
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={increaseBpm} style={styles.button}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.beatBtnContainer}>
        <TouchableOpacity onPress={() => toggleActiveBoxCount(1)} style={styles.button}>
          <Text style={styles.buttonTitle}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleActiveBoxCount(3)} style={styles.button}>
          <Text style={styles.buttonTitle}>3</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleActiveBoxCount(2)} style={styles.button}>
          <Text style={styles.buttonTitle}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleActiveBoxCount(4)} style={styles.button}>
          <Text style={styles.buttonTitle}>16</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statBtn}>
        <TouchableOpacity onPress={toggleMetronome} style={styles.button}>
          <Text style={styles.buttonTitle}>{isPlaying ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap:'wrap',
    backgroundColor: '#fff',
  },
  borderContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: 'white',
    width: 380,
    marginTop: 250,
    height:200,
    borderRadius: 20,
    marginHorizontal: 'auto',  
  },
  subBox:{
    borderWidth:0,
    backgroundColor:'gray',
    width:50,
    height:50,
    marginHorizontal: 'auto',
    marginTop: 75,
    borderRadius: 30
  },
  text:{
    textAlign: 'center',
    marginTop: 13,
    fontSize: 20,
    fontWeight: 'bold',
  },
  
    itemContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: 450,
    },
    item: {
      marginHorizontal: 'auto',
      // flex: 1, // 두 View 컴포넌트를 동일한 너비로 설정
    },
    bpmText: {

      fontSize: 40,
      
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center', // 수평 정렬을 위해 중앙 정렬 설정
    },
  
  button: {
    padding: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
  },
  statBtn: {
    width: 300,
    height: 80,
    borderRadius: 15,
    marginTop: 60,
    marginHorizontal: 'auto',
    // backgroundColor: '#007BFF',
  },
  buttonTitle: {
    textAlign: 'center',
    fontSize: 30, // 텍스트 크기 설정
    color: '#fff',
  },
  // 이전의 스타일
  activeBox: {
    backgroundColor: 'red', // 활성화된 박스의 색상
  },

  beatBtnContainer: {
    display: "flex",
    flexDirection: 'row',
    marginTop: 150,
    marginHorizontal: 'auto'
  }
});

export default App;
