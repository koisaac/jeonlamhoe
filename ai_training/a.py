import tensorflowjs as tfjs
import tensorflow as tf
import os



path = "/content/drive/MyDrive/전람회"
model = tf.keras.models.load_model(os.path.join("save","model"))
tfjs.converters.save_keras_model(model, os.path.join("save","save","json"))