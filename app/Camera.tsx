import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // For icons
import { analyzePlantImage, type PlantImageAnalysis } from '@/app/utils/Gemini'; // Update import path
import { router } from 'expo-router';

const CaptureImageScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PlantImageAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleCaptureImage = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedPhoto(photo.uri);
      } catch (error) {
        console.error('Error capturing image:', error);
        setErrorMessage('Failed to capture image');
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleConfirmPhoto = async () => {
    if (!capturedPhoto) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await analyzePlantImage(capturedPhoto);
      console.log('Analysis result:', result);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setErrorMessage('Failed to analyze image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCamera = () => (
    <CameraView style={styles.camera} ref={cameraRef} onCameraReady={() => setCameraReady(true)}>
      <View style={styles.captureContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={handleCaptureImage} >
          <MaterialIcons name="camera" size={40} color="#000" />
        </TouchableOpacity>
      </View>
    </CameraView>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: capturedPhoto! }} style={styles.previewImage} />
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <MaterialIcons name="replay" size={24} color="#fff" />
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPhoto}>
          <MaterialIcons name="check" size={24} color="#fff" />
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <TouchableOpacity style={styles.button} onPress={()=>router.back()}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
      <Text style={styles.resultHeader}>Analysis Results</Text>

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Fungus Detected:</Text>
        <Text style={[styles.resultValue, analysisResult?.fungus_detected ? styles.dangerText : styles.successText]}>
          {analysisResult?.fungus_detected ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Disease Detected:</Text>
        <Text style={[styles.resultValue, analysisResult?.disease_detected ? styles.dangerText : styles.successText]}>
          {analysisResult?.disease_detected ? 'Yes' : 'No'}
        </Text>
      </View>

      <Text style={styles.explanationText}>{analysisResult?.explanation}</Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsHeader}>Suggestions:</Text>
        {analysisResult?.suggestions.map((suggestion, index) => (
          <Text key={index} style={styles.suggestionText}>
            • {suggestion}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={[styles.retakeButton,{marginTop:40}]} onPress={handleRetake}>
        <MaterialIcons name="replay" size={24} color="#fff" />
        <Text style={styles.buttonText}>Analyze Another</Text>
      </TouchableOpacity>
    </View>
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission not granted.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.processingText}>Analyzing your plant...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {analysisResult ? renderResults() : capturedPhoto ? renderPreview() : renderCamera()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a', // Dark gray background
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  captureContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 50,
    elevation: 5,
  },
  retakeButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  resultHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#ff4444', // Red for danger
  },
  successText: {
    color: '#4CAF50', // Green for success
  },
  explanationText: {
    fontSize: 17,
    color: '#fff',
    marginVertical: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
  },
  suggestionsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#aaa',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1a1a1a', // dark background color
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CaptureImageScreen;