#!/usr/bin/env python3
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
from tensorflow.keras import datasets, layers, models
from keras import optimizers
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import sys


path = "./"

gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:  # gpu가 있다면, 용량 한도를 5GB로 설정
  tf.config.experimental.set_virtual_device_configuration(gpus[0], 
        [tf.config.experimental.VirtualDeviceConfiguration(memory_limit=5*1024)])


base = VGG16(weights= 'imagenet', include_top=False, input_shape = (512,512,3))
base.trainable = False
for layer in base.layers:
  print('{} : {}'.format(layer, layer.trainable))

#데이터 증가을 위한 코드
train_gen = ImageDataGenerator(horizontal_flip = True,\
                              rotation_range = 35,
                              rescale = 1./255,
                              zoom_range = [0.7,1.5],
                              brightness_range = (0.7,1.0),
                              width_shift_range = 0.1,
                              height_shift_range = 0.1)
#val, gen generator
VT_gen = ImageDataGenerator(rescale = 1./255)

batch_size = 5
#generator.flowfromdirectory

#학습시킬 이미지를 불러오는 코
train_genorator = train_gen.flow_from_directory(os.path.join(path,"train"),
                                                target_size = (512,512), batch_size = batch_size, class_mode = 'binary')
val_genorator = VT_gen.flow_from_directory(os.path.join(path,"train"), shuffle = False,
                                           target_size = (512,512), batch_size = batch_size ,class_mode = 'binary')
test_genorator = VT_gen.flow_from_directory(os.path.join(path,"train"), shuffle = False,
                                           target_size = (512,512), batch_size = batch_size ,class_mode = 'binary')


model = models.Sequential()
model.add(base)
model.add(layers.BatchNormalization())
model.add(layers.Flatten())
model.add(layers.Dense(256, activation = 'relu'))
model.add(layers.Dropout(0.4))
model.add(layers.Dense(256, activation = 'relu'))
model.add(layers.Dropout(0.4))
model.add(layers.Dense(1, activation = 'sigmoid'))

sgd = tf.keras.optimizers.SGD(learning_rate= 1.e-4, momentum = 0.9)
model.compile(optimizer = sgd, loss = 'binary_crossentropy',metrics = ['accuracy'])
epochs =int(sys.argv[1])
history = model.fit(train_genorator, batch_size = batch_size, epochs= epochs , validation_data = val_genorator, steps_per_epoch= 20//batch_size)

model.save(os.path.join(path,"save"))


model.summary()