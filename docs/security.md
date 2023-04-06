# First steps into security
As a trainer I want to make sure that the public Internet can't read the published messages.
One solution would he to come up with a shared password (between students and trainers).


This is called **symmetric encryption** because you need the same password for encoding and decoding.
This would lock out the whole wide internet since every client and present message can be only read if you know the password. 
This is still not enough - we are now safe on the outside but not the inside. 


A curious student may still use the password to encode all messages landing on the client/presenter topics even though they are only meant for the trainer.
Let's note, this issue we only have on the client topic, for the presenter topic we are totally happy that everyone can read from it (each client actually has to, remember we've already locked out the rest of the internet by agreeing on a password).
Let's see how we can protect the messages on the client topic. Put down simply - whatever we put down on the client topic we only want to be read by the presenter and nobody else.
Cryptography comes to rescue here:  **Asymmetric encryption (with RSA)** ensuring that students can encrypt a message with a shared key (provided by the presenter) and can not decode it without the shared key. 
In our case this means student A encrypts a message, but student B can't decrypt since he also only knows the shared key of the presenter. 
Only the presenter had the private key and can decrypt the messages.

Last step: How to make sure that the payload is actually from the presenter the client has paired with? You need to sign the message hash (sha) with the private key and recreate hash of payload and then verify on client side with public key.
