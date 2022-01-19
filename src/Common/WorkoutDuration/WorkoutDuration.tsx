import React from "react";
import {Text, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {ExerciseType} from "../../Utils/types";
import {theme} from "../../Theme/theme";
import {colors} from "../../Theme/colors";

interface WorkoutDurationType {
  exercises: ExerciseType[];
}

export const secondsToMinSec = (time: number) => {
  let minSec = '';
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  function str_pad_left(string: number, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  if (!seconds) minSec = str_pad_left(minutes, '', 2) + 'min';
  else if (!minutes) minSec = str_pad_left(seconds, '0', 2) + 'sec';
  else minSec = str_pad_left(minutes, '', 2) + 'min ' + str_pad_left(seconds, '0', 2) + 'sec';

  return minSec;
}

export default function WorkoutDuration({exercises}: WorkoutDurationType) {
  let time = 0;
  exercises.forEach(exercise => time += exercise.breakTimeInSec);

  return (
    <View style={theme.containers.alignCenter}>
      <Icon name="timer-outline" size={18} color={`${colors.text}80`}/>
      <Text style={theme.text.secondary}>
        {secondsToMinSec(time)}
      </Text>
    </View>
  )
}

