import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { toLocalDate } from '../dday/logic/dates';
import type { DdayData } from '../dday/types';
import {
  backupFileName,
  type BackupParseResult,
  createBackupJson,
  parseBackupJson,
} from './backupFile';

/** 백업 파일을 임시 폴더에 만들고 공유 메뉴로 넘긴다(카카오톡·드라이브·파일 저장 등). */
export async function exportBackup(data: DdayData, dialogTitle: string): Promise<void> {
  const now = new Date();
  const file = new File(Paths.cache, backupFileName(toLocalDate(now)));
  if (file.exists) file.delete();
  file.create();
  file.write(createBackupJson(data, now));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle });
}

/** 파일을 골라 읽는다. 사용자가 취소하면 null. */
export async function pickBackup(): Promise<BackupParseResult | null> {
  // 클라우드·메신저 앱이 JSON을 다른 형식으로 알려주는 경우가 있어 모든 파일을 보여준다.
  const picked = await File.pickFileAsync({ mimeTypes: '*/*' });
  if (picked.canceled) return null;
  return parseBackupJson(await picked.result.text());
}
