import { useRef, useImperativeHandle, forwardRef, useState, useCallback, memo } from 'react'
import { FlatList, View, type FlatListProps as _FlatListProps } from 'react-native'

import Dialog, { type DialogType } from '@/components/common/Dialog'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { getListMusics } from '@/core/list'
import { createStyle } from '@/utils/tools'
import { scaleSizeH } from '@/utils/pixelRatio'

type FlatListProps = _FlatListProps<LX.Music.MusicInfo>
const ITEM_HEIGHT = scaleSizeH(46)

const ListItem = memo(({ info, index, onPress }: {
  info: LX.Music.MusicInfo
  index: number
  onPress: (info: LX.Music.MusicInfo, index: number) => void
}) => {
  const theme = useTheme()

  return (
    <Button style={{ ...styles.listItem, height: ITEM_HEIGHT }} onPress={() => { onPress(info, index) }}>
      <Text style={styles.sn} size={13} color={theme['c-300']}>{index + 1}</Text>
      <View style={styles.itemInfo}>
        <Text color={theme['c-font']} size={14} numberOfLines={1}>{info.name}</Text>
        <Text style={styles.singer} size={11} color={theme['c-500']} numberOfLines={1}>
          {info.singer}{info.meta.albumName ? ` · ${info.meta.albumName}` : ''}
        </Text>
      </View>
    </Button>
  )
}, (prevProps, nextProps) => {
  return prevProps.info === nextProps.info && prevProps.index === nextProps.index
})

interface ModalProps {
  onSelected: (listInfo: LX.List.MyListInfo, musicInfo: LX.Music.MusicInfo, index: number) => void
}

const Modal = forwardRef<MusicPositionSelectModalType, ModalProps>(({ onSelected }, ref) => {
  const t = useI18n()
  const theme = useTheme()
  const dialogRef = useRef<DialogType>(null)
  const listInfoRef = useRef<LX.List.MyListInfo>(initListInfo as LX.List.MyListInfo)
  const [title, setTitle] = useState('')
  const [list, setList] = useState<LX.Music.MusicInfo[]>([])

  useImperativeHandle(ref, () => ({
    show(listInfo) {
      listInfoRef.current = listInfo
      setTitle(listInfo.name)
      void getListMusics(listInfo.id).then(musics => {
        setList(musics)
      })
      dialogRef.current?.setVisible(true)
    },
  }))

  const handleSelect = useCallback((musicInfo: LX.Music.MusicInfo, index: number) => {
    dialogRef.current?.setVisible(false)
    onSelected(listInfoRef.current, musicInfo, index)
  }, [onSelected])

  const renderItem = useCallback(({ item, index }: { item: LX.Music.MusicInfo, index: number }) => {
    return <ListItem info={item} index={index} onPress={handleSelect} />
  }, [handleSelect])
  const getkey = useCallback<NonNullable<FlatListProps['keyExtractor']>>(item => item.id, [])
  const getItemLayout = useCallback<NonNullable<FlatListProps['getItemLayout']>>((data, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  }, [])

  return (
    <Dialog ref={dialogRef} title={title}>
      {
        list.length
          ? <FlatList
              style={styles.list}
              maxToRenderPerBatch={8}
              windowSize={10}
              removeClippedSubviews={true}
              initialNumToRender={12}
              data={list}
              renderItem={renderItem}
              keyExtractor={getkey}
              getItemLayout={getItemLayout}
            />
          : <View style={styles.noitem}><Text color={theme['c-font-label']}>{t('no_item')}</Text></View>
      }
    </Dialog>
  )
})

export interface MusicPositionSelectModalType {
  show: (listInfo: LX.List.MyListInfo) => void
}
const initListInfo = {}

export default forwardRef<MusicPositionSelectModalType, ModalProps>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const modalRef = useRef<MusicPositionSelectModalType>(null)

  useImperativeHandle(ref, () => ({
    show(listInfo) {
      if (visible) modalRef.current?.show(listInfo)
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          modalRef.current?.show(listInfo)
        })
      }
    },
  }))

  return (
    visible
      ? <Modal ref={modalRef} onSelected={props.onSelected} />
      : null
  )
})

const styles = createStyle({
  list: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
  },
  listItem: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  sn: {
    width: 34,
    textAlign: 'center',
    paddingLeft: 3,
    paddingRight: 3,
  },
  itemInfo: {
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 5,
    paddingRight: 2,
    paddingTop: 4,
    paddingBottom: 4,
  },
  singer: {
    marginTop: 2,
  },
  noitem: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
    paddingTop: 40,
    paddingBottom: 40,
  },
})
