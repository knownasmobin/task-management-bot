class PhoneVerification {
    constructor(config) {
        this.config = config || { get: () => false }; // Provide safe fallback for browser
        this.pendingVerifications = new Map();
        this.verifiedNumbers = JSON.parse(localStorage.getItem('verified_phones') || '[]');
    }

    async requestPhoneVerification(userInfo) {
        if (!this.config.get('ENABLE_PHONE_VERIFICATION')) {
            return { success: true, message: 'Phone verification disabled' };
        }

        const phoneNumber = userInfo.phone_number;
        if (!phoneNumber) {
            throw new Error('Phone number is required for verification');
        }

        // Check if phone is already verified
        if (this.isPhoneVerified(phoneNumber)) {
            return { success: true, message: 'Phone already verified' };
        }

        // In a real app, this would integrate with a service like Twilio, AWS SNS, etc.
        // For demo purposes, we'll simulate the verification process
        
        const verificationCode = this.generateVerificationCode();
        const verificationId = this.generateVerificationId();
        
        // Store pending verification
        this.pendingVerifications.set(verificationId, {
            phone_number: phoneNumber,
            code: verificationCode,
            user_info: userInfo,
            created_at: Date.now(),
            attempts: 0,
            max_attempts: 3
        });

        // In production, send SMS here
        console.log(`Verification code for ${phoneNumber}: ${verificationCode}`);
        
        // Show verification modal
        this.showVerificationModal(verificationId, phoneNumber);
        
        return {
            success: true,
            verification_id: verificationId,
            message: 'Verification code sent'
        };
    }

    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateVerificationId() {
        return 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showVerificationModal(verificationId, phoneNumber) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'phoneVerificationModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>📱 Phone Verification</h3>
                </div>
                <div class="modal-body">
                    <div class="verification-form">
                        <p>We've sent a verification code to:</p>
                        <div class="phone-display">${this.maskPhoneNumber(phoneNumber)}</div>
                        
                        <div class="form-group">
                            <label for="verificationCode">Enter 6-digit code</label>
                            <input type="text" 
                                   id="verificationCode" 
                                   placeholder="000000" 
                                   maxlength="6" 
                                   class="verification-input"
                                   autocomplete="off">
                        </div>
                        
                        <div class="verification-timer">
                            Code expires in: <span id="timerDisplay">05:00</span>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" 
                                    class="btn-secondary" 
                                    onclick="phoneVerification.resendCode('${verificationId}')">
                                Resend Code
                            </button>
                            <button type="button" 
                                    class="btn-primary" 
                                    onclick="phoneVerification.verifyCode('${verificationId}')">
                                Verify
                            </button>
                        </div>
                        
                        <div class="verification-help">
                            <p><small>Didn't receive the code? Check your messages or try resending.</small></p>
                            <p><small><strong>For demo:</strong> Check browser console for the verification code</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-focus on input
        document.getElementById('verificationCode').focus();
        
        // Add input formatting
        document.getElementById('verificationCode').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
            if (e.target.value.length === 6) {
                this.verifyCode(verificationId);
            }
        });
        
        // Start countdown timer
        this.startVerificationTimer(300); // 5 minutes
    }

    maskPhoneNumber(phoneNumber) {
        if (!phoneNumber) return 'Unknown';
        
        // Remove non-digits
        const digits = phoneNumber.replace(/\D/g, '');
        
        if (digits.length >= 10) {
            // Show first 2 and last 2 digits
            return `+${digits.substr(0, 2)}****${digits.substr(-2)}`;
        }
        
        return phoneNumber;
    }

    startVerificationTimer(seconds) {
        const timerDisplay = document.getElementById('timerDisplay');
        if (!timerDisplay) return;
        
        const timer = setInterval(() => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                timerDisplay.textContent = 'Expired';
                timerDisplay.style.color = '#dc2626';
            }
            
            seconds--;
        }, 1000);
    }

    async verifyCode(verificationId) {
        const codeInput = document.getElementById('verificationCode');
        const enteredCode = codeInput?.value;
        
        if (!enteredCode || enteredCode.length !== 6) {
            this.showVerificationError('Please enter a 6-digit code');
            return;
        }
        
        const verification = this.pendingVerifications.get(verificationId);
        if (!verification) {
            this.showVerificationError('Verification session expired');
            return;
        }
        
        // Check if expired (5 minutes)
        if (Date.now() - verification.created_at > 300000) {
            this.pendingVerifications.delete(verificationId);
            this.showVerificationError('Verification code expired');
            return;
        }
        
        // Check attempts
        verification.attempts++;
        if (verification.attempts > verification.max_attempts) {
            this.pendingVerifications.delete(verificationId);
            this.showVerificationError('Too many attempts. Please request a new code.');
            return;
        }
        
        // Verify code
        if (enteredCode === verification.code) {
            // Success!
            this.markPhoneAsVerified(verification.phone_number);
            this.pendingVerifications.delete(verificationId);
            
            // Close modal
            document.getElementById('phoneVerificationModal')?.remove();
            
            // Complete user authentication
            if (window.auth) {
                verification.user_info.phone_verified = true;
                window.auth.authenticateUser(verification.user_info);
            }
            
            this.showVerificationSuccess();
        } else {
            this.showVerificationError(`Invalid code. ${verification.max_attempts - verification.attempts} attempts remaining.`);
        }
    }

    async resendCode(verificationId) {
        const verification = this.pendingVerifications.get(verificationId);
        if (!verification) {
            this.showVerificationError('Verification session not found');
            return;
        }
        
        // Generate new code
        const newCode = this.generateVerificationCode();
        verification.code = newCode;
        verification.created_at = Date.now();
        verification.attempts = 0;
        
        // In production, send new SMS here
        console.log(`New verification code for ${verification.phone_number}: ${newCode}`);
        
        // Show success message
        this.showToast('New verification code sent!');
        
        // Reset timer
        this.startVerificationTimer(300);
    }

    markPhoneAsVerified(phoneNumber) {
        if (!this.verifiedNumbers.includes(phoneNumber)) {
            this.verifiedNumbers.push(phoneNumber);
            localStorage.setItem('verified_phones', JSON.stringify(this.verifiedNumbers));
        }
    }

    isPhoneVerified(phoneNumber) {
        return this.verifiedNumbers.includes(phoneNumber);
    }

    showVerificationError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'verification-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #fee2e2;
            color: #dc2626;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 0.9rem;
        `;
        
        // Remove existing errors
        document.querySelectorAll('.verification-error').forEach(el => el.remove());
        
        // Add new error
        const form = document.querySelector('.verification-form');
        if (form) {
            form.appendChild(errorDiv);
            
            // Remove after 5 seconds
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    showVerificationSuccess() {
        this.showToast('Phone number verified successfully! ✅');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Admin methods for phone verification management
    getVerificationStats() {
        return {
            total_verified: this.verifiedNumbers.length,
            pending_verifications: this.pendingVerifications.size,
            verified_numbers: this.verifiedNumbers
        };
    }

    removePhoneVerification(phoneNumber) {
        const index = this.verifiedNumbers.indexOf(phoneNumber);
        if (index > -1) {
            this.verifiedNumbers.splice(index, 1);
            localStorage.setItem('verified_phones', JSON.stringify(this.verifiedNumbers));
            return true;
        }
        return false;
    }

    // Integration with Telegram Web App for phone sharing
    async requestTelegramPhone() {
        return new Promise((resolve, reject) => {
            if (window.Telegram && window.Telegram.WebApp) {
                const tg = window.Telegram.WebApp;
                
                // Request phone number access
                tg.requestContact((contact) => {
                    if (contact && contact.phone_number) {
                        resolve({
                            phone_number: contact.phone_number,
                            first_name: contact.first_name,
                            last_name: contact.last_name,
                            user_id: contact.user_id
                        });
                    } else {
                        reject(new Error('Phone number access denied'));
                    }
                });
            } else {
                reject(new Error('Telegram WebApp not available'));
            }
        });
    }
}

// Initialize phone verification
let phoneVerification;
document.addEventListener('DOMContentLoaded', () => {
    // Skip Config initialization in browser - use default settings
    if (window.PhoneVerification) {
        phoneVerification = new PhoneVerification(null);
        // expose for debugging to avoid unused var warning in some bundlers
        window.phoneVerification = phoneVerification;
    }
});