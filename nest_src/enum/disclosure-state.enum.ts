export enum DisclosureState {
  POLLING_SUCCESS = 'pollingComplete',
  POLLING_FAILED = 'pollingFailed',
  PUBLISHING_SUCCESS = 'publishingComplete',
  PUBLISHING_FAILED = 'publishingFailed',
  TELEGRAM_SUCCESS = 'telegramComplete',
  TELEGRAM_FAILED = 'telegramFailed',
  QUEUEING_FAILED = 'queueingFailed',
  ALL_SUCCESS = 'allSuccess',
}
