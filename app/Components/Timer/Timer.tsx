import * as React from 'react'
import { useEffect, useState } from 'react'
import { colors } from '../../Theme/colors'

interface AlertProps {
  label: string;
  buttonLabel?: string;
  onSuccess: () => void;
  onClick: () => void;
  time?: number;
}

type CirclePropsType = {
  sqSize: number;
  strokeWidth: number;
  percentage: number;
};

export default function AlertWithTimer({ label, onSuccess, onClick, time = 5, buttonLabel = 'Undo' }: AlertProps) {
  const [timeLeft, setTimeLeft] = useState<number>(time)

  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => {
        setTimeLeft(t => (t -= 0.1))
      }, 100)
    } else {
      onSuccess()
    }
  }, [timeLeft, onSuccess])

  const TimeCircle = ({ sqSize, strokeWidth, percentage }: CirclePropsType) => {
    const radius = (sqSize - strokeWidth) / 2
    const viewBox = `0 0 ${sqSize} ${sqSize}`
    const dashArray = radius * Math.PI * 2
    const dashOffset = dashArray - (dashArray * percentage) / 130

    const Circle = ({ color, dashOffsetCircle = 100 }: { color: string; dashOffsetCircle?: number }) => {
      return (
        <circle
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius - 5}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffsetCircle,
            stroke: color,
            transition: 'all 1s',
            fill: '#00000000',
            strokeLinecap: 'square',
            strokeLinejoin: 'round',
          }}
        />
      )
    }

    return (
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <Circle color={`${colors.primary}50`} dashOffsetCircle={33} />
        <Circle color={colors.primary} dashOffsetCircle={dashOffset} />
        <text
          // className={classes.textTime}
          x='50%' y='50%' dy='.3em' textAnchor='middle'>
          {`${Math.round(timeLeft)}`}
        </text>
      </svg>
    )
  }
// return (
//   <>
//     <Circle/>
//   </>
// )
};