// MicPermissionManagerBridge.m 파일
#import <React/RCTBridgeModule.h>
#import "MicPermissionManager.h"

@implementation RCT_EXTERN_MODULE(MicPermissionManager, NSObject)

RCT_EXTERN_METHOD(requestMicrophonePermissionWithCompletion:(RCTResponseSenderBlock)completion)

@end
