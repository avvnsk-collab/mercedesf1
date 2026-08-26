import {
  launchApp,
  SYSTEM_APP_ALARM,
  SYSTEM_APP_STOPWATCH,
  SYSTEM_APP_COUNTDOWN,
  SYSTEM_APP_HR,
  SYSTEM_APP_WEATHER,
  SYSTEM_APP_STATUS,
  SYSTEM_APP_CALENDAR,
} from '@zos/router'

const CYAN = 0x00b8c8
const WHITE = 0xffffff
const MUTED = 0xbfc3c5

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`)
const WEEK_RU = ['', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ']
const MONTH_RU = ['', 'ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЯ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']

Page({
  build() {
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0, y: 0, w: 480, h: 480, src: 'bg.jpg'
    })

    const time = hmSensor.createSensor(hmSensor.id.TIME)
    const step = hmSensor.createSensor(hmSensor.id.STEP)
    const heart = hmSensor.createSensor(hmSensor.id.HEART)
    const battery = hmSensor.createSensor(hmSensor.id.BATTERY)
    const weather = hmSensor.createSensor(hmSensor.id.WEATHER)

    const text = (x, y, w, h, size, color, value, align = hmUI.align.CENTER_H) => hmUI.createWidget(hmUI.widget.TEXT, {
      x, y, w, h,
      color,
      text_size: size,
      align_h: align,
      align_v: hmUI.align.CENTER_V,
      text_style: hmUI.text_style.NONE,
      text: value,
    })

    const hourText = text(52, 154, 160, 122, 106, CYAN, pad2(time.format_hour ?? time.hour))
    const minuteText = text(268, 154, 160, 122, 106, CYAN, pad2(time.minute))
    const secondText = text(207, 236, 66, 54, 45, WHITE, pad2(time.second))
    const dateText = text(145, 292, 190, 34, 26, WHITE, '')
    const heartText = text(76, 107, 57, 46, 42, WHITE, heart.last > 0 ? `${heart.last}` : '--')
    const batteryText = text(350, 107, 62, 46, 42, WHITE, `${battery.current}`)
    const weatherText = text(234, 118, 66, 42, 36, WHITE, '--°')
    const stepText = text(188, 407, 128, 48, 46, WHITE, `${step.current}`)

    const progress = hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
      center_x: 240,
      center_y: 240,
      radius: 229,
      start_angle: -90,
      end_angle: 270,
      line_width: 4,
      color: CYAN,
      level: 0,
    })

    hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      second_centerX: 240,
      second_centerY: 240,
      second_posX: 240,
      second_posY: 240,
      second_path: 'second_pointer.png',
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
      const level = Math.max(0, Math.min(100, Math.round(step.current * 100 / target)))
      progress.setProperty(hmUI.prop.MORE, { level })
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

    updateDate()
    updateSteps()
    updateWeather()

    step.addEventListener(hmSensor.event.CHANGE, updateSteps)
    heart.addEventListener(heart.event.LAST, updateHeart)
    battery.addEventListener(hmSensor.event.CHANGE, updateBattery)

    hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
      resume_call: () => {
        updateTime(); updateSteps(); updateHeart(); updateBattery(); updateWeather()
      },
      pause_call: () => {},
    })

    const invisibleButton = (x, y, w, h, appId) => hmUI.createWidget(hmUI.widget.BUTTON, {
      x, y, w, h,
      radius: 0,
      normal_color: 0x000000,
      press_color: 0x000000,
      alpha: 0,
      text: '',
      click_func: () => launchApp({ appId, native: true }),
    })

    // Agreed tap zones
    invisibleButton(52, 154, 160, 122, SYSTEM_APP_ALARM)       // hours -> Alarms
    invisibleButton(207, 232, 66, 62, SYSTEM_APP_STOPWATCH)    // seconds -> Stopwatch
    invisibleButton(268, 154, 160, 122, SYSTEM_APP_COUNTDOWN)  // minutes -> Timer
    invisibleButton(72, 98, 75, 62, SYSTEM_APP_HR)              // heart rate
    invisibleButton(222, 105, 90, 58, SYSTEM_APP_WEATHER)       // weather
    invisibleButton(340, 98, 80, 62, SYSTEM_APP_STATUS)         // battery/status
    invisibleButton(148, 286, 190, 44, SYSTEM_APP_CALENDAR)     // date/calendar
    invisibleButton(170, 398, 150, 72, SYSTEM_APP_STATUS)       // steps/activity status
  },
})
