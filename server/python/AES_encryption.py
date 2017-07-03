
import base64
from Crypto import Random
from Crypto.Cipher import AES
import hashlib

BS = 16
pad = lambda s: s + (BS - len(s) % BS) * chr(BS - len(s) % BS)
unpad = lambda s : s[0:-ord(s[-1])]
import sys

class AESCipher:

    def __init__( self ):
        self.key = b'\x74\x68\x69\x73\x49\x73\x41\x53\x65\x63\x72\x65\x74\x4b\x65\x79'

    def encrypt( self, raw ):
        try:
            print (raw)
            if not (raw is None and raw is ''):
                raw = pad(raw)
                cipher = AES.new( self.key, AES.MODE_ECB)
                print base64.b64encode(cipher.encrypt( raw ) )
                return base64.b64encode(cipher.encrypt( raw ) )
            else:
                print "Invalid input"
        except Exception as e:
            import traceback
            traceback.print_exc()
            print ("Exception occured is : ",e)

def main():
    #get our data as an array from read_in()
    args = sys.argv
    obj =  AESCipher()
    print args[1],"??????????????"

    x = obj.encrypt(args[1])
    print x
    return x
if __name__ == '__main__':
    main()


