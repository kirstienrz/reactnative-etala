import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

const ScanQR = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarcodeScanned = ({ type, data }) => {
        if (scanned) return;
        setScanned(true);
        
        // Check if the scanned data is a URL
        if (data.startsWith('http://') || data.startsWith('https://')) {
            Alert.alert(
                'QR Code Scanned',
                `Do you want to open this link?\n\n${data}`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setScanned(false)
                    },
                    {
                        text: 'Open',
                        onPress: async () => {
                            try {
                                await Linking.openURL(data);
                                setScanned(false);
                            } catch (error) {
                                Alert.alert('Error', 'Could not open the link');
                                setScanned(false);
                            }
                        }
                    }
                ]
            );
        } else {
            // For non-URL QR codes, just display the content
            Alert.alert(
                'QR Code Scanned',
                data,
                [
                    {
                        text: 'OK',
                        onPress: () => setScanned(false)
                    }
                ]
            );
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'pdf417'],
                }}
                style={StyleSheet.absoluteFillObject}
            />
            
            {/* Overlay with transparent square */}
            <View style={styles.overlayContainer}>
                <View style={styles.topOverlay} />
                <View style={styles.middleRow}>
                    <View style={styles.sideOverlay} />
                    <View style={styles.scanSquare}>
                        {/* Corner borders */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.sideOverlay} />
                </View>
                <View style={styles.bottomOverlay}>
                    <Text style={styles.instructionText}>
                        Point your camera at a QR code
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    middleRow: {
        flexDirection: 'row',
        height: 250,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    scanSquare: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 30,
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#fff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ScanQR;