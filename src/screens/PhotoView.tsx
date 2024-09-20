import { StackScreenProps } from '@react-navigation/stack';
import React, { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { RootStackParamList } from '../App';

interface IProps {
    route: StackScreenProps<RootStackParamList, 'PhotoView'>['route']
}

const PhotoView = (props: IProps): JSX.Element => {

    const { route } = props

    const scale = useRef(new Animated.Value(1)).current;

    const onPinchEvent = Animated.event(
        [
            {
                nativeEvent: { scale },
            },
        ],
        {
            useNativeDriver: true,
        }
    );

    const onPinchStateChange = useCallback(
        (event: { nativeEvent: { oldState: number; }; }) => {
            if (event.nativeEvent.oldState === State.ACTIVE) {
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();
            }
        },
        [scale]
    );

    return (
        <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
        >
            <Animated.Image
                source={{ uri: route.params.photoUrl }}
                style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ scale }],
                }}
                resizeMode="contain"
            />
        </PinchGestureHandler>
    );
};

export default PhotoView;
