#import <Foundation/Foundation.h>

@interface MicPermissionManager : NSObject

- (void)requestMicrophonePermissionWithCompletion:(void (^)(BOOL granted))completion;

@end
