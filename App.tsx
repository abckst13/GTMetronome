import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import TrackPlayer, { Capability, Event, State, PlaybackState } from 'react-native-track-player';

const App: React.FC = () => {
  const [bpm, setBpm] = useState<number>(60); // Beats per minute
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stateChangeListener, setStateChangeListener] = useState<any>(null);
  const [trackChangeListener, setTrackChangeListener] = useState<any>(null);

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
    const onStateChange = (state: PlaybackState) => {
      console.log('Playback state changed:', state);
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
  }, []);

  const setupPlayer = async (): Promise<void> => {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.add({
      id: 'tick',
      url: require('./assets/tick.mp3'),
      title: 'Tick',
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
    const beatDuration = 60 / bpm; // 한 박자당 걸리는 시간(초)
    const playbackRate = 1 / beatDuration; // 초당 재생 속도
  
    await TrackPlayer.seekTo(0);
    await TrackPlayer.setRate(playbackRate);
    await TrackPlayer.play();
    setIsPlaying(true);
  };

  const stopMetronome = async (): Promise<void> => {
    await TrackPlayer.pause();
    setIsPlaying(false);
  };

  const toggleMetronome = (): void => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const increaseBpm = (): void => setBpm((prev) => Math.min(prev + 1, 240));
  const decreaseBpm = (): void => setBpm((prev) => Math.max(prev - 1, 30));

  return (
    <View style={styles.container}>
      <Text style={styles.bpmText}>{bpm} BPM</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={decreaseBpm} style={styles.button}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={increaseBpm} style={styles.button}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Button title={isPlaying ? 'Stop' : 'Start'} onPress={toggleMetronome} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bpmText: {
    fontSize: 48,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 20,
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
});

export default App;
