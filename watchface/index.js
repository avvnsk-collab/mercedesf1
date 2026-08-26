const CYAN = 0x00b8c8
const WHITE = 0xffffff

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`)
const WEEK_RU = ['', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ']
const MONTH_RU = ['', 'ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЯ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']

Page({
  build() {
    hmUI.createWidget(hmUI.widget.IMG, { x: 0, y: 0, w: 480, h: 480, src: 'mercedes_bg.jpg' })

    const time = hmSensor.createSensor(hmSensor.id.TIME)
    const step = hmSensor.createSensor(hmSensor.id.STEP)
    const heart = hmSensor.createSensor(hmSensor.id.HEART)
    const battery = hmSensor.createSensor(hmSensor.id.BATTERY)
    const weather = hmSensor.createSensor(hmSensor.id.WEATHER)

    const text = (x, y, w, h, size, color, value) => hmUI.createWidget(hmUI.widget.TEXT, {
      x, y, w, h, color, text_size: size,
      align_h: hmUI.align.CENTER_H, align_v: hmUI.align.CENTER_V,
      text_style: hmUI.text_style.NONE, text: value,
    })

    const hourText = text(73, 174, 139, 110, 104, CYAN, pad2(time.format_hour ?? time.hour))
    const minuteText = text(270, 174, 143, 110, 104, CYAN, pad2(time.minute))
    const secondText = text(215, 237, 52, 42, 38, WHITE, pad2(time.second))
    const heartText = text(86, 121, 42, 36, 31, WHITE, heart.last > 0 ? `${heart.last}` : '--')
    const batteryText = text(350, 121, 44, 36, 31, WHITE, `${battery.current}`)
    const weatherText = text(229, 141, 61, 39, 30, WHITE, '--°')
    const dateText = text(152, 282, 176, 32, 24, WHITE, '')
    const stepText = text(206, 395, 92, 42, 34, WHITE, `${step.current}`)

    const progress = hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
      center_x: 240, center_y: 240, radius: 230,
      start_angle: -90, end_angle: 270, line_width: 4,
      color: CYAN, level: 0,
    })

    const updateDate = () => {
      const week = WEEK_RU[time.week] || ''
      const mon = MONTH_RU[time.month] || ''
      dateText.setProperty(hmUI.prop.MORE, { text: `${week}  ${pad2(time.day)}  ${mon}` })
    }
    const updateTime = () => {
      hourText.setProperty(hmUI.prop.MORE, { text: pad2(time.format_hour ?? time.hour) })
      minuteText.setProperty(hmUI.prop.MORE, { text: pad2(time.minute) })
      secondText.setProperty(hmUI.prop.MORE, { text: pad2(time.second) })
      updateDate()
    }
    const updateSteps = () => {
      stepText.setProperty(hmUI.prop.MORE, { text: `${step.current}` })
      const target = step.target > 0 ? step.target : 10000
      progress.setProperty(hmUI.prop.MORE, { level: Math.max(0, Math.min(100, Math.round(step.current * 100 / target))) })
    }
    const updateHeart = () => heartText.setProperty(hmUI.prop.MORE, { text: heart.last > 0 ? `${heart.last}` : '--' })
    const updateBattery = () => batteryText.setProperty(hmUI.prop.MORE, { text: `${battery.current}` })
    const updateWeather = () => {
      try {
        const forecast = weather.getForecastWeather()
        const item = forecast && forecast.forecastData && forecast.forecastData.data && forecast.forecastData.data[0]
        weatherText.setProperty(hmUI.prop.MORE, { text: item ? `${item.high}°` : '--°' })
      } catch (e) {
        weatherText.setProperty(hmUI.prop.MORE, { text: '--°' })
      }
    }

    updateTime(); updateSteps(); updateHeart(); updateBattery(); updateWeather()
    step.addEventListener(hmSensor.event.CHANGE, updateSteps)
    heart.addEventListener(heart.event.LAST, updateHeart)
    battery.addEventListener(hmSensor.event.CHANGE, updateBattery)

    hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
      resume_call: () => { updateTime(); updateSteps(); updateHeart(); updateBattery(); updateWeather() },
      pause_call: () => {},
    })

    hmUI.createWidget(hmUI.widget.IMG_CLICK, { x: 73, y: 174, w: 139, h: 110, type: hmUI.data_type.ALARM_CLOCK, show_level: hmUI.show_level.ONLY_NORMAL })
    hmUI.createWidget(hmUI.widget.IMG_CLICK, { x: 270, y: 174, w: 143, h: 110, type: hmUI.data_type.COUNT_DOWN, show_level: hmUI.show_level.ONLY_NORMAL })
    hmUI.createWidget(hmUI.widget.IMG_CLICK, { x: 215, y: 237, w: 52, h: 42, type: hmUI.data_type.STOP_WATCH, show_level: hmUI.show_level.ONLY_NORMAL })
  },
})
