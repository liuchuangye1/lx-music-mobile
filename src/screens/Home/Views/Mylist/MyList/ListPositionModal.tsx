import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { View } from 'react-native'

import ConfirmAlert, { type ConfirmAlertType } from '@/components/common/ConfirmAlert'
import Text from '@/components/common/Text'
import Input, { type InputType } from '@/components/common/Input'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'

export interface ListPositionModalType {
  show: (listInfo: LX.List.MyListInfo) => void
}
const initListInfo = {}

interface ListPositionModalProps {
  onUpdatePosition: (listInfo: LX.List.MyListInfo, position: number) => void
}

export default forwardRef<ListPositionModalType, ListPositionModalProps>(({ onUpdatePosition }, ref) => {
  const theme = useTheme()
  const t = useI18n()
  const alertRef = useRef<ConfirmAlertType>(null)
  const inputRef = useRef<InputType>(null)
  const listInfoRef = useRef<LX.List.MyListInfo>(initListInfo as LX.List.MyListInfo)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [visible, setVisible] = useState(false)

  const handleShow = () => {
    alertRef.current?.setVisible(true)
    requestAnimationFrame(() => {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    })
  }
  useImperativeHandle(ref, () => ({
    show(listInfo) {
      listInfoRef.current = listInfo
      setTitle(listInfo.name)
      if (visible) handleShow()
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          handleShow()
        })
      }
    },
  }))

  const handleConfirm = () => {
    const result = /^[1-9]\d*/.exec(text.trim())
    const num = result ? parseInt(result[0]) : 0
    if (!num) return
    setText(String(num))
    alertRef.current?.setVisible(false)
    onUpdatePosition(listInfoRef.current, num - 1)
  }

  return (
    visible
      ? <ConfirmAlert
          ref={alertRef}
          onConfirm={handleConfirm}
          onHide={() => { setText('') }}
        >
        <View style={styles.content}>
          <Text style={styles.title}>{t('change_position_music_title', { name: title })}</Text>
          <Input
            placeholder={t('change_position_tip')}
            value={text}
            onChangeText={setText}
            ref={inputRef}
            keyboardType="numeric"
            style={{ ...styles.input, backgroundColor: theme['c-primary-input-background'] }}
          />
        </View>
      </ConfirmAlert>
      : null
  )
})

const styles = createStyle({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
  },
  title: {
    marginBottom: 5,
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
    borderRadius: 4,
  },
})
