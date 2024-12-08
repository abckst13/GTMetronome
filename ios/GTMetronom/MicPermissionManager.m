#import "MicPermissionManager.h"
#import <AVFoundation/AVFoundation.h>

@implementation MicPermissionManager

- (void)requestMicrophonePermissionWithCompletion:(void (^)(BOOL granted))completion {
    // 마이크 권한을 요청합니다.
    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeAudio completionHandler:^(BOOL granted) {
        dispatch_async(dispatch_get_main_queue(), ^{
            // 권한 요청 결과를 completion 블록을 통해 전달합니다.
            if (completion) {
                completion(granted);
            }
        });
    }];
}

@end